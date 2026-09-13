/**
 * Security Middleware Suite for Digital Seva Backend
 * ---------------------------------------------------
 * - In-memory Rate Limiter (per-IP)
 * - NoSQL Injection Sanitizer (strips MongoDB operators)
 * - XSS Sanitizer (strips dangerous HTML/JS from inputs)
 */

// ─── In-Memory Rate Limiter ──────────────────────────────────────────────────
// Stores request counts per IP with automatic cleanup

const rateLimitStores = {};

function createRateLimiter({ windowMs = 15 * 60 * 1000, maxRequests = 100, name = 'general' } = {}) {
    // Initialize store for this limiter
    if (!rateLimitStores[name]) {
        rateLimitStores[name] = new Map();
        // Cleanup expired entries every 5 minutes
        setInterval(() => {
            const now = Date.now();
            const store = rateLimitStores[name];
            for (const [key, entry] of store) {
                if (now - entry.windowStart > windowMs) {
                    store.delete(key);
                }
            }
        }, 5 * 60 * 1000).unref();
    }

    return (req, res, next) => {
        const store = rateLimitStores[name];
        const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();
        let entry = store.get(clientIp);

        if (!entry || (now - entry.windowStart > windowMs)) {
            // New window
            entry = { count: 1, windowStart: now };
            store.set(clientIp, entry);
        } else {
            entry.count += 1;
        }

        // Set rate-limit headers
        const remaining = Math.max(0, maxRequests - entry.count);
        const resetTime = Math.ceil((entry.windowStart + windowMs - now) / 1000);
        res.set('X-RateLimit-Limit', String(maxRequests));
        res.set('X-RateLimit-Remaining', String(remaining));
        res.set('X-RateLimit-Reset', String(resetTime));

        if (entry.count > maxRequests) {
            const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
            res.set('Retry-After', String(retryAfter));
            return res.status(429).json({
                message: `Too many requests. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
                retryAfterSeconds: retryAfter
            });
        }

        next();
    };
}

// Pre-configured rate limiters
const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 5,              // 5 login attempts
    name: 'login'
});

const submissionLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 10,             // 10 submissions
    name: 'submission'
});

const trackingLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 30,             // 30 tracking queries
    name: 'tracking'
});

const generalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 100,            // 100 requests
    name: 'general'
});

// ─── NoSQL Injection Sanitizer ───────────────────────────────────────────────
// Recursively strips MongoDB query operators from objects

const MONGO_OPERATORS = /^\$(gt|gte|lt|lte|ne|eq|in|nin|or|and|not|nor|exists|type|regex|where|all|elemMatch|size|mod|text|search|expr|jsonSchema|meta|slice|comment|rand|natural|inc|set|unset|push|pull|pop|rename|bit|min|max|mul|addToSet|each|position|currentDate)/i;

function sanitizeValue(val) {
    if (val === null || val === undefined) return val;

    if (typeof val === 'string') {
        return val;
    }

    if (Array.isArray(val)) {
        return val.map(sanitizeValue);
    }

    if (typeof val === 'object') {
        const cleaned = {};
        for (const key of Object.keys(val)) {
            // Strip keys that look like MongoDB operators
            if (MONGO_OPERATORS.test(key)) {
                continue; // Remove dangerous operator
            }
            cleaned[key] = sanitizeValue(val[key]);
        }
        return cleaned;
    }

    return val;
}

function mongoSanitizer(req, res, next) {
    if (req.body) req.body = sanitizeValue(req.body);
    if (req.query) req.query = sanitizeValue(req.query);
    if (req.params) req.params = sanitizeValue(req.params);
    next();
}

// ─── XSS Sanitizer ──────────────────────────────────────────────────────────
// Strips dangerous HTML tags and event handlers from string inputs

function stripXSS(str) {
    if (typeof str !== 'string') return str;
    return str
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\bon\w+\s*=\s*[^\s>]*/gi, '')
        // Remove javascript: protocol
        .replace(/javascript\s*:/gi, '')
        // Remove data: URIs with script content
        .replace(/data\s*:\s*text\/html/gi, '')
        // Remove iframe, embed, object tags
        .replace(/<\s*\/?\s*(iframe|embed|object|applet|form)\b[^>]*>/gi, '')
        .trim();
}

function sanitizeStringsDeep(obj) {
    if (typeof obj === 'string') return stripXSS(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeStringsDeep);
    if (obj && typeof obj === 'object') {
        const cleaned = {};
        for (const key of Object.keys(obj)) {
            cleaned[key] = sanitizeStringsDeep(obj[key]);
        }
        return cleaned;
    }
    return obj;
}

function xssSanitizer(req, res, next) {
    if (req.body) req.body = sanitizeStringsDeep(req.body);
    next();
}

// ─── Regex Escape Helper ─────────────────────────────────────────────────────
// Escapes special regex characters to prevent ReDoS attacks

function escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Account Lockout Tracker ─────────────────────────────────────────────────
// Tracks failed login attempts per account identifier

const loginAttempts = new Map();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Cleanup old lockout entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of loginAttempts) {
        if (now - entry.lastAttempt > LOCKOUT_DURATION_MS) {
            loginAttempts.delete(key);
        }
    }
}, 10 * 60 * 1000).unref();

function checkAccountLockout(identifier) {
    const entry = loginAttempts.get(identifier);
    if (!entry) return { locked: false };

    const now = Date.now();
    if (entry.count >= LOCKOUT_THRESHOLD) {
        const elapsed = now - entry.lockedAt;
        if (elapsed < LOCKOUT_DURATION_MS) {
            const remainingMinutes = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 60000);
            return { locked: true, remainingMinutes };
        }
        // Lockout expired, reset
        loginAttempts.delete(identifier);
        return { locked: false };
    }
    return { locked: false };
}

function recordFailedLogin(identifier) {
    const entry = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0, lockedAt: 0 };
    entry.count += 1;
    entry.lastAttempt = Date.now();
    if (entry.count >= LOCKOUT_THRESHOLD) {
        entry.lockedAt = Date.now();
    }
    loginAttempts.set(identifier, entry);
}

function resetLoginAttempts(identifier) {
    loginAttempts.delete(identifier);
}

module.exports = {
    createRateLimiter,
    loginLimiter,
    submissionLimiter,
    trackingLimiter,
    generalLimiter,
    mongoSanitizer,
    xssSanitizer,
    escapeRegex,
    checkAccountLockout,
    recordFailedLogin,
    resetLoginAttempts
};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Operator = require('../models/Operator');
const {
    loginLimiter,
    checkAccountLockout,
    recordFailedLogin,
    resetLoginAttempts
} = require('../middleware/security');

const generateToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2d' });

// @route POST /api/auth/login — Admin login (rate-limited + lockout)
router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check account lockout
        const lockoutKey = `admin:${username.toLowerCase()}`;
        const lockStatus = checkAccountLockout(lockoutKey);
        if (lockStatus.locked) {
            return res.status(423).json({
                message: `Account temporarily locked due to too many failed attempts. Try again in ${lockStatus.remainingMinutes} minute(s).`
            });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            recordFailedLogin(lockoutKey);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            recordFailedLogin(lockoutKey);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Successful login — reset lockout counter
        resetLoginAttempts(lockoutKey);

        const token = generateToken({ id: admin._id, role: 'admin' });
        res.json({
            token,
            role: 'admin',
            username: admin.username,
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
});

// @route POST /api/auth/operator/login — Operator login (rate-limited + lockout)
router.post('/operator/login', loginLimiter, async (req, res) => {
    const { phone, password } = req.body;
    try {
        if (!phone || !password) {
            return res.status(400).json({ message: 'Phone and password are required' });
        }

        // Check account lockout
        const lockoutKey = `operator:${phone}`;
        const lockStatus = checkAccountLockout(lockoutKey);
        if (lockStatus.locked) {
            return res.status(423).json({
                message: `Account temporarily locked due to too many failed attempts. Try again in ${lockStatus.remainingMinutes} minute(s).`
            });
        }

        // Find operator by phone (need to use select('+password') since toJSON strips it)
        const operator = await Operator.findOne({ phone }).select('+password');
        if (!operator) {
            recordFailedLogin(lockoutKey);
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        if (!operator.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
        }

        const isMatch = await operator.matchPassword(password);
        if (!isMatch) {
            recordFailedLogin(lockoutKey);
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        // Successful login — reset lockout counter
        resetLoginAttempts(lockoutKey);

        const token = generateToken({
            id: operator._id,
            role: 'operator',
            operatorRole: operator.role || 'operator',
            permissions: operator.permissions || {},
            operatorId: operator._id
        });

        res.json({
            token,
            role: 'operator',
            operatorRole: operator.role || 'operator',
            permissions: operator.permissions || {},
            operatorId: operator._id,
            name: operator.name,
            phone: operator.phone,
        });
    } catch (err) {
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
});

// @route POST /api/auth/setup  — first-time admin setup (DEVELOPMENT ONLY)
router.post('/setup', async (req, res) => {
    // Only allow setup in development or if explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SETUP !== 'true') {
        return res.status(403).json({ message: 'Setup is disabled in production' });
    }

    try {
        const existingAdmin = await Admin.findOne({});
        if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });
        const admin = await Admin.create({
            username: process.env.ADMIN_USERNAME || 'admin',
            password: process.env.ADMIN_PASSWORD || 'Admin@1234',
        });
        res.status(201).json({ message: 'Admin created', username: admin.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


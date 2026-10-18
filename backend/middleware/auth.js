const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Operator = require('../models/Operator');

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let permissions = decoded.permissions || {};
        let operatorRole = decoded.operatorRole || (decoded.role === 'admin' ? 'admin' : 'operator');

        if (decoded.role === 'operator' && (decoded.operatorId || decoded.id)) {
            try {
                const op = await Operator.findById(decoded.operatorId || decoded.id).select('role permissions isActive');
                if (op) {
                    if (!op.isActive) {
                        return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
                    }
                    if (op.permissions) permissions = op.permissions;
                    if (op.role) operatorRole = op.role;
                }
            } catch (dbErr) {
                // Fallback to token payload if DB lookup encounters an issue
            }
        }

        req.user = {
            id: decoded.id,
            role: decoded.role || 'admin',
            operatorRole,
            permissions,
            operatorId: decoded.operatorId || decoded.id
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalid or expired' });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
};

// Granular permission check middleware
const requirePermission = (permissionName) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.role === 'admin') return next(); // Admin has all permissions
    if (req.user.permissions && req.user.permissions[permissionName]) {
        return next();
    }
    return res.status(403).json({ message: `Forbidden: missing permission '${permissionName}'` });
};

module.exports = { protect, authorize, requirePermission };

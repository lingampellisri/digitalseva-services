const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Operator = require('../models/Operator');

const generateToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/login — Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = generateToken({ id: admin._id, role: 'admin' });
        res.json({
            token,
            role: 'admin',
            username: admin.username,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/auth/operator/login — Operator login
router.post('/operator/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        if (!phone || !password) {
            return res.status(400).json({ message: 'Phone and password are required' });
        }
        // Find operator by phone (need to use select('+password') since toJSON strips it)
        const operator = await Operator.findOne({ phone }).select('+password');
        if (!operator) return res.status(401).json({ message: 'Invalid phone or password' });

        if (!operator.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
        }

        const isMatch = await operator.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid phone or password' });

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
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/auth/setup  — first-time admin setup (disable after use)
router.post('/setup', async (req, res) => {
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

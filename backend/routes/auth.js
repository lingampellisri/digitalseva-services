const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        res.json({
            token: generateToken(admin._id),
            username: admin.username,
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

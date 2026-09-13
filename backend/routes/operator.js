const express = require('express');
const router = express.Router();
const Operator = require('../models/Operator');
const { protect, authorize } = require('../middleware/auth');

// @route GET /api/operators  — public (limited display fields for privacy)
router.get('/', async (req, res) => {
    try {
        const operators = await Operator.find({ isActive: { $ne: false } })
            .select('name photoUrl bio whatsapp whatsappGroupLink sortOrder')
            .sort({ sortOrder: 1, createdAt: -1 });
        res.json(operators);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/operators/all  — admin only (all operators including inactive)
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const operators = await Operator.find({}).sort({ sortOrder: 1, createdAt: -1 });
        res.json(operators);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/operators/:id  — public (single operator)
router.get('/:id', async (req, res) => {
    try {
        const operator = await Operator.findById(req.params.id);
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        res.json(operator);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/operators  — admin only (create new operator)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        // Auto-assign sortOrder to end of list if not provided
        if (req.body.sortOrder === undefined) {
            const count = await Operator.countDocuments();
            req.body.sortOrder = count;
        }
        if (!req.body.password) {
            req.body.password = 'Operator@123';
        }
        const operator = await Operator.create(req.body);
        res.status(201).json(operator);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'An operator with this phone number already exists' });
        }
        res.status(400).json({ message: err.message });
    }
});

// @route PUT /api/operators/:id  — admin only (update operator)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        // Don't allow password update through regular PUT — use reset-password
        const updateData = { ...req.body };
        delete updateData.password;

        const operator = await Operator.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        res.json(operator);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'An operator with this phone number already exists' });
        }
        res.status(400).json({ message: err.message });
    }
});

// @route PATCH /api/operators/:id/toggle  — admin only (toggle active status)
router.patch('/:id/toggle', protect, authorize('admin'), async (req, res) => {
    try {
        const operator = await Operator.findById(req.params.id);
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        operator.isActive = !operator.isActive;
        await operator.save();
        res.json(operator);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route PATCH /api/operators/:id/reset-password  — admin only
router.patch('/:id/reset-password', protect, authorize('admin'), async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ message: 'Password must be at least 4 characters' });
        }
        const operator = await Operator.findById(req.params.id);
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        operator.password = newPassword;
        await operator.save(); // pre-save hook hashes the password
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route DELETE /api/operators/:id  — admin only (permanent delete)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const operator = await Operator.findByIdAndDelete(req.params.id);
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        res.json({ message: 'Operator deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

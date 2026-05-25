const express = require('express');
const router = express.Router();
const Operator = require('../models/Operator');
const { protect } = require('../middleware/auth');

// @route GET /api/operators  — public (all active operators, sorted)
router.get('/', async (req, res) => {
    try {
        const operators = await Operator.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
        res.json(operators);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/operators/all  — protected (all operators including inactive)
router.get('/all', protect, async (req, res) => {
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

// @route POST /api/operators  — protected (create new operator)
router.post('/', protect, async (req, res) => {
    try {
        // Auto-assign sortOrder to end of list if not provided
        if (req.body.sortOrder === undefined) {
            const count = await Operator.countDocuments();
            req.body.sortOrder = count;
        }
        const operator = await Operator.create(req.body);
        res.status(201).json(operator);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route PUT /api/operators/:id  — protected (update operator)
router.put('/:id', protect, async (req, res) => {
    try {
        const operator = await Operator.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        res.json(operator);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route PATCH /api/operators/:id/toggle  — protected (toggle active status)
router.patch('/:id/toggle', protect, async (req, res) => {
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

// @route DELETE /api/operators/:id  — protected (permanent delete)
router.delete('/:id', protect, async (req, res) => {
    try {
        const operator = await Operator.findByIdAndDelete(req.params.id);
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        res.json({ message: 'Operator deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

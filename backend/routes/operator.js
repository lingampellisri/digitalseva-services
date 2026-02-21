const express = require('express');
const router = express.Router();
const Operator = require('../models/Operator');
const { protect } = require('../middleware/auth');

// @route GET /api/operator  — public (get first operator record)
router.get('/', async (req, res) => {
    try {
        const operator = await Operator.findOne({});
        res.json(operator || {});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/operator  — protected (create)
router.post('/', protect, async (req, res) => {
    try {
        const existing = await Operator.findOne({});
        if (existing) {
            const updated = await Operator.findByIdAndUpdate(existing._id, req.body, { new: true });
            return res.json(updated);
        }
        const operator = await Operator.create(req.body);
        res.status(201).json(operator);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route PUT /api/operator/:id  — protected
router.put('/:id', protect, async (req, res) => {
    try {
        const operator = await Operator.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!operator) return res.status(404).json({ message: 'Operator not found' });
        res.json(operator);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

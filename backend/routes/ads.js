const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const { protect, authorize } = require('../middleware/auth');

// @route GET /api/ads — Public (active ads, sorted)
router.get('/', async (req, res) => {
    try {
        const { placement, postId } = req.query;
        const filter = { isActive: { $ne: false } };

        if (placement && placement !== 'all') {
            filter.$or = [{ placement }, { placement: 'all' }];
        }
        if (postId) {
            filter.$or = (filter.$or || []).concat([
                { targetPostId: postId },
                { targetPostId: null }
            ]);
        }

        const ads = await Ad.find(filter).sort({ sortOrder: 1, createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/ads/all — Admin only (all ads including inactive)
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const ads = await Ad.find({}).sort({ sortOrder: 1, createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/ads/:id — Public (single ad)
router.get('/:id', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
        res.json(ad);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/ads — Admin only (create ad)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        if (!req.body.title || !req.body.mediaUrl) {
            return res.status(400).json({ message: 'Title and media URL are required' });
        }
        if (req.body.sortOrder === undefined) {
            const count = await Ad.countDocuments();
            req.body.sortOrder = count;
        }
        const ad = await Ad.create(req.body);
        res.status(201).json(ad);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route PUT /api/ads/:id — Admin only (update ad)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
        res.json(ad);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route PATCH /api/ads/:id/toggle — Admin only (toggle active status)
router.patch('/:id/toggle', protect, authorize('admin'), async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
        ad.isActive = !ad.isActive;
        await ad.save();
        res.json(ad);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route DELETE /api/ads/:id — Admin only (delete ad)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const ad = await Ad.findByIdAndDelete(req.params.id);
        if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
        res.json({ message: 'Advertisement deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

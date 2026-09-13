const express = require('express');
const router = express.Router();
const CustomerRequest = require('../models/CustomerRequest');
const Post = require('../models/Post');
const Operator = require('../models/Operator');
const AssignmentCounter = require('../models/AssignmentCounter');
const { protect, authorize } = require('../middleware/auth');
const { submissionLimiter, trackingLimiter, escapeRegex } = require('../middleware/security');

// ─── Round-Robin Assignment Helper ───────────────────────────────────────────
async function assignOperator() {
    const operators = await Operator.find({ isActive: true }).sort({ sortOrder: 1 });
    if (operators.length === 0) return null;

    let counter = await AssignmentCounter.findOne({});
    if (!counter) {
        counter = await AssignmentCounter.create({ lastAssignedIndex: -1, totalRequests: 0 });
    }

    const nextIndex = (counter.lastAssignedIndex + 1) % operators.length;
    const selected = operators[nextIndex];

    counter.lastAssignedIndex = nextIndex;
    counter.totalRequests += 1;
    await counter.save();

    await Operator.findByIdAndUpdate(selected._id, {
        $inc: { totalAssigned: 1 },
        $set: { lastAssignedAt: new Date() }
    });

    return selected;
}

// ─── POST / — Public: Submit application request ────────────────────────────
router.post('/', submissionLimiter, async (req, res) => {
    try {
        const { customerName, customerPhone, customerAge, customerEmail, customerMessage, postId } = req.body;

        // Validate required fields
        if (!customerName || !customerPhone || !postId) {
            return res.status(400).json({ message: 'Name, phone, and service selection are required' });
        }

        // Validate phone
        const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
        }

        // Fetch post
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Service not found' });

        // Check if post is active
        if (new Date(post.endDate) < new Date()) {
            return res.status(400).json({ message: 'This service application period has ended' });
        }

        // Check for duplicate (same phone + same post + still active)
        const existing = await CustomerRequest.findOne({
            customerPhone: cleanPhone,
            postId,
            status: { $nin: ['completed', 'rejected', 'cancelled'] }
        });
        if (existing) {
            return res.status(409).json({
                message: 'You have already submitted a request for this service. Our operator will contact you soon.'
            });
        }

        // Round-robin assignment
        const assignedOperator = await assignOperator();

        const statusHistory = [
            {
                status: 'submitted',
                title: 'Application Submitted',
                changedByRole: 'customer',
                timestamp: new Date(),
                note: 'Service application submitted successfully by citizen'
            }
        ];

        let status = 'submitted';
        if (assignedOperator) {
            status = 'assigned';
            statusHistory.push({
                status: 'assigned',
                title: 'Assigned to Operator',
                changedByRole: 'system',
                timestamp: new Date(),
                note: `Routed via automated round-robin to operator ${assignedOperator.name}`
            });
        }

        // Create request
        const request = await CustomerRequest.create({
            customerName: customerName.trim(),
            customerAge: customerAge || undefined,
            customerPhone: cleanPhone,
            customerEmail: customerEmail?.trim().toLowerCase() || undefined,
            customerMessage: customerMessage?.trim() || '',
            postId,
            serviceName: post.titleEn,
            serviceCategory: post.category,
            assignedTo: assignedOperator ? assignedOperator._id : null,
            assignedAt: assignedOperator ? new Date() : null,
            status,
            statusHistory
        });

        res.status(201).json({
            message: 'Application submitted successfully! Save your tracking ID to monitor lifecycle status.',
            request: {
                _id: request._id,
                trackingId: request.trackingId,
                serviceName: request.serviceName,
                status: request.status,
                assignedOperator: assignedOperator ? {
                    name: assignedOperator.name,
                    phone: assignedOperator.phone,
                    whatsapp: assignedOperator.whatsapp
                } : null
            }
        });
    } catch (err) {
        console.error('CustomerRequest creation error:', err);
        res.status(500).json({ message: 'Failed to submit request. Please try again.' });
    }
});

// ─── GET / — Admin: All requests with filters ───────────────────────────────
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, assignedTo, category, search, page = 1, limit = 50 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (category) filter.serviceCategory = category;
        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { trackingId: { $regex: safeSearch, $options: 'i' } },
                { customerName: { $regex: safeSearch, $options: 'i' } },
                { customerPhone: { $regex: safeSearch, $options: 'i' } },
                { serviceName: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [requests, total] = await Promise.all([
            CustomerRequest.find(filter)
                .populate('assignedTo', 'name phone email')
                .populate('postId', 'titleEn category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            CustomerRequest.countDocuments(filter)
        ]);

        res.json({
            requests,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── GET /mine — Operator: Assigned requests (or all if permitted) ────────────
router.get('/mine', protect, authorize('operator'), async (req, res) => {
    try {
        const { status, page = 1, limit = 50, viewAll, search } = req.query;
        const operatorId = req.user.operatorId || req.user.id;
        const canViewAll = (req.user.permissions?.canViewAllRequests || req.user.operatorRole === 'senior_operator') && (viewAll === 'true' || viewAll === true);

        const filter = canViewAll ? {} : { assignedTo: operatorId };

        if (status) filter.status = status;
        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { trackingId: { $regex: safeSearch, $options: 'i' } },
                { customerName: { $regex: safeSearch, $options: 'i' } },
                { customerPhone: { $regex: safeSearch, $options: 'i' } },
                { serviceName: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [requests, total] = await Promise.all([
            CustomerRequest.find(filter)
                .populate('assignedTo', 'name phone email')
                .populate('postId', 'titleEn titleTe category imageUrl')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            CustomerRequest.countDocuments(filter)
        ]);

        // Compute stats for this operator
        const allForOp = await CustomerRequest.aggregate([
            { $match: { assignedTo: operatorId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const stats = { total: 0, pending: 0, assigned: 0, in_progress: 0, contacted: 0, completed: 0, rejected: 0 };
        allForOp.forEach(s => { stats[s._id] = s.count; stats.total += s.count; });

        res.json({
            requests,
            stats,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── GET /stats — Dashboard statistics ──────────────────────────────────────
router.get('/stats', protect, authorize('admin', 'operator'), async (req, res) => {
    try {
        const matchFilter = {};
        if (req.user.role === 'operator') {
            matchFilter.assignedTo = req.user.operatorId || req.user.id;
        }

        const [byStatus, byCategory, todayCount, weekCount, monthCount] = await Promise.all([
            CustomerRequest.aggregate([
                { $match: matchFilter },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            CustomerRequest.aggregate([
                { $match: matchFilter },
                { $group: { _id: '$serviceCategory', count: { $sum: 1 } } }
            ]),
            CustomerRequest.countDocuments({
                ...matchFilter,
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            CustomerRequest.countDocuments({
                ...matchFilter,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            CustomerRequest.countDocuments({
                ...matchFilter,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
        ]);

        const statusMap = {};
        let total = 0;
        byStatus.forEach(s => { statusMap[s._id] = s.count; total += s.count; });

        const categoryMap = {};
        byCategory.forEach(c => { categoryMap[c._id] = c.count; });

        res.json({
            total,
            byStatus: statusMap,
            byCategory: categoryMap,
            todayCount,
            weekCount,
            monthCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

function getStatusTitle(status) {
    const titles = {
        submitted: 'Application Submitted',
        assigned: 'Assigned to Officer',
        under_review: 'Under Review & Verification',
        in_progress: 'In Process',
        action_required: 'Action Required from Citizen',
        completed: 'Service Completed & Delivered',
        rejected: 'Application Rejected',
        cancelled: 'Cancelled by Citizen',
        pending: 'Pending Review',
        contacted: 'Citizen Contacted'
    };
    return titles[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ─── GET /track/:query — Public: Track request strictly by trackingId ────────────
router.get('/track/:query', trackingLimiter, async (req, res) => {
    try {
        const queryParam = (req.params.query || '').trim();
        if (!queryParam) {
            return res.status(400).json({ message: 'Tracking ID (e.g., DS-2026-XXXXX) is required.' });
        }

        // Check if citizen entered a phone number
        const cleanPhone = queryParam.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length === 10 && !queryParam.toUpperCase().startsWith('DS')) {
            return res.status(400).json({
                message: 'Applications can only be tracked using your Tracking ID (e.g., DS-2026-XXXXX). Searching by phone number is disabled for citizen privacy.'
            });
        }

        const safeQuery = escapeRegex(queryParam);
        const requests = await CustomerRequest.find({
            trackingId: { $regex: new RegExp(`^${safeQuery}$`, 'i') }
        })
            .select('trackingId customerName serviceName serviceCategory status priority statusHistory operatorMessage createdAt completedAt assignedTo')
            .populate('assignedTo', 'name phone whatsapp')
            .sort({ createdAt: -1 });

        if (!requests || requests.length === 0) {
            return res.status(404).json({ message: `No application found with Tracking ID "${queryParam}". Please check your Tracking ID and try again.` });
        }

        // Mask citizen name for privacy (e.g., "Srinivas Lingampelli" -> "S***s L***i")
        const maskName = (name) => {
            if (!name) return 'Citizen';
            return name.split(' ').map(part => {
                if (part.length <= 2) return part;
                return part[0] + '*'.repeat(Math.max(2, part.length - 2)) + part.slice(-1);
            }).join(' ');
        };

        const sanitized = requests.map(reqItem => ({
            _id: reqItem._id,
            trackingId: reqItem.trackingId,
            customerMaskedName: maskName(reqItem.customerName),
            serviceName: reqItem.serviceName,
            serviceCategory: reqItem.serviceCategory,
            status: reqItem.status,
            priority: reqItem.priority,
            createdAt: reqItem.createdAt,
            completedAt: reqItem.completedAt,
            operatorMessage: reqItem.operatorMessage || '',
            assignedOperator: reqItem.assignedTo ? {
                name: reqItem.assignedTo.name,
                phone: reqItem.assignedTo.phone,
                whatsapp: reqItem.assignedTo.whatsapp
            } : null,
            statusHistory: (reqItem.statusHistory || []).map(h => ({
                status: h.status,
                title: h.title || getStatusTitle(h.status),
                timestamp: h.timestamp,
                note: h.note || '',
                changedByRole: h.changedByRole
            }))
        }));

        res.json({
            count: sanitized.length,
            requests: sanitized
        });
    } catch (err) {
        console.error('Track request error:', err);
        res.status(500).json({ message: 'Error retrieving tracking information' });
    }
});

// ─── GET /:id — Single request detail ───────────────────────────────────────
router.get('/:id', protect, authorize('admin', 'operator'), async (req, res) => {
    try {
        const request = await CustomerRequest.findById(req.params.id)
            .populate('assignedTo', 'name phone email whatsapp')
            .populate('postId', 'titleEn titleTe category imageUrl');

        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Operator can only see their own requests
        if (req.user.role === 'operator') {
            const opId = (req.user.operatorId || req.user.id).toString();
            if (request.assignedTo?._id.toString() !== opId) {
                return res.status(403).json({ message: 'Access denied: This request is not assigned to you' });
            }
        }

        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── PUT /:id — Update status, notes, message ──────────────────────────────
router.put('/:id', protect, authorize('admin', 'operator'), async (req, res) => {
    try {
        const request = await CustomerRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Operator can only update their own requests
        if (req.user.role === 'operator') {
            const opId = (req.user.operatorId || req.user.id).toString();
            if (request.assignedTo?.toString() !== opId) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const { status, operatorNotes, operatorMessage, priority } = req.body;

        // Check granular permissions for operator
        if (req.user.role === 'operator') {
            if (status && status !== request.status && req.user.permissions && req.user.permissions.canUpdateStatus === false) {
                return res.status(403).json({ message: 'Permission denied: Your role cannot update request status' });
            }
            if ((operatorNotes !== undefined || operatorMessage !== undefined) && req.user.permissions && req.user.permissions.canAddNotes === false) {
                return res.status(403).json({ message: 'Permission denied: Your role cannot add notes or customer messages' });
            }
        }

        // Track status change
        if (status && status !== request.status) {
            const stageTitle = req.body.statusTitle || getStatusTitle(status);
            request.statusHistory.push({
                status,
                title: stageTitle,
                changedBy: req.user.id,
                changedByRole: req.user.role,
                timestamp: new Date(),
                note: req.body.statusNote || `Status updated to: ${stageTitle}`
            });
            request.status = status;

            if (status === 'completed') {
                request.completedAt = new Date();
                // Update operator stats
                if (request.assignedTo) {
                    await Operator.findByIdAndUpdate(request.assignedTo, { $inc: { totalCompleted: 1 } });
                }
            }
        }

        if (operatorNotes !== undefined) request.operatorNotes = operatorNotes;
        if (operatorMessage !== undefined) request.operatorMessage = operatorMessage;
        if (priority) request.priority = priority;

        await request.save();

        const populated = await CustomerRequest.findById(request._id)
            .populate('assignedTo', 'name phone email')
            .populate('postId', 'titleEn category');

        res.json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── PUT /:id/reassign — Admin: Reassign to different operator ──────────────
router.put('/:id/reassign', protect, authorize('admin'), async (req, res) => {
    try {
        const { newOperatorId, reason } = req.body;
        const request = await CustomerRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const newOperator = await Operator.findById(newOperatorId);
        if (!newOperator) return res.status(404).json({ message: 'Operator not found' });

        const oldOperatorId = request.assignedTo;
        request.assignedTo = newOperator._id;
        request.assignedAt = new Date();
        request.statusHistory.push({
            status: request.status,
            changedBy: req.user.id,
            changedByRole: 'admin',
            timestamp: new Date(),
            note: `Reassigned to ${newOperator.name}${reason ? ': ' + reason : ''}`
        });

        await request.save();

        // Update operator stats
        newOperator.totalAssigned += 1;
        newOperator.lastAssignedAt = new Date();
        await newOperator.save();

        if (oldOperatorId) {
            await Operator.findByIdAndUpdate(oldOperatorId, { $inc: { totalAssigned: -1 } });
        }

        res.json({ message: 'Request reassigned successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

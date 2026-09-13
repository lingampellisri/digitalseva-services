const mongoose = require('mongoose');

const CustomerRequestSchema = new mongoose.Schema({
    // Unique Public Tracking Reference
    trackingId: {
        type: String
    },

    // Customer Information
    customerName: { type: String, required: true, trim: true },
    customerAge: { type: Number, min: 1, max: 150 },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerMessage: { type: String, default: '', maxlength: 1000 },

    // Service Reference
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    serviceName: { type: String, required: true },
    serviceCategory: { type: String },

    // Operator Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Operator',
        default: null
    },
    assignedAt: { type: Date, default: null },

    // Standardized Lifecycle Status
    status: {
        type: String,
        enum: [
            'submitted',        // Stage 1: Received
            'assigned',         // Stage 2: Routed to operator
            'under_review',     // Stage 3: Document & eligibility verification
            'in_progress',      // Stage 4: Department / portal filing
            'action_required',  // Stage 4B: Customer action/clarification needed
            'completed',        // Stage 5: Service fulfilled & completed
            'rejected',         // Terminal: Ineligible or rejected
            'cancelled',        // Terminal: Cancelled
            // Backward-compatible legacy aliases:
            'pending',
            'contacted'
        ],
        default: 'submitted'
    },

    // Operator Notes & Customer Message
    operatorNotes: { type: String, default: '' },      // Internal private
    operatorMessage: { type: String, default: '' },    // Customer visible

    // Audit Trail Lifecycle History
    statusHistory: [{
        status: { type: String, required: true },
        title: { type: String, default: '' },
        changedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
        changedByRole: { type: String, default: 'system' }, // system, operator, admin, customer
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' }
    }],

    // Metadata
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    completedAt: { type: Date, default: null }
}, { timestamps: true });

// Auto-generate trackingId before validation
CustomerRequestSchema.pre('validate', function () {
    if (!this.trackingId) {
        const year = new Date().getFullYear();
        const rand = Math.floor(10000 + Math.random() * 90000);
        this.trackingId = `DS-${year}-${rand}`;
    }
});

// Indexes for high performance
CustomerRequestSchema.index({ trackingId: 1 }, { unique: true, sparse: true });
CustomerRequestSchema.index({ assignedTo: 1, status: 1 });
CustomerRequestSchema.index({ postId: 1 });
CustomerRequestSchema.index({ status: 1, createdAt: -1 });
CustomerRequestSchema.index({ customerPhone: 1 });

module.exports = mongoose.model('CustomerRequest', CustomerRequestSchema);

const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    title: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'pdf', 'gif', 'document', 'auto'],
        default: 'auto'
    },
    linkUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    badge: { type: String, default: 'Marketing Partner' },
    placement: {
        type: String,
        enum: ['post_details', 'home_sidebar', 'banner', 'all'],
        default: 'post_details'
    },
    targetPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ad', AdSchema);

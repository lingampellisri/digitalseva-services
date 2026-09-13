const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    titleEn: { type: String, required: true },
    titleTe: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    requiredDocsEn: [{ type: String }],
    requiredDocsTe: [{ type: String }],
    extraInfoEn: { type: String, default: '' },
    extraInfoTe: { type: String, default: '' },
    category: {
        type: String,
        enum: ['job', 'pan', 'aadhaar', 'scholarship', 'government', 'private', 'other'],
        default: 'other'
    },
    notificationUrl: { type: String, default: '' },
    // Marketing Ad Fields for Post Details Page
    adMediaUrl: { type: String, default: '' },
    adMediaType: {
        type: String,
        enum: ['image', 'video', 'pdf', 'gif', 'document', 'auto', ''],
        default: 'auto'
    },
    adTitle: { type: String, default: '' },
    adLinkUrl: { type: String, default: '' },
    adDescription: { type: String, default: '' },
    adBadge: { type: String, default: 'Featured Promotion' }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);

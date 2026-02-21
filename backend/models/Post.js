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
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);

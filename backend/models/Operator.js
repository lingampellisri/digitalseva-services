const mongoose = require('mongoose');

const OperatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    photoUrl: { type: String, default: '' },
    whatsapp: { type: String },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Operator', OperatorSchema);

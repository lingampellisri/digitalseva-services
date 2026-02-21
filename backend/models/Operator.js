const mongoose = require('mongoose');

const OperatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    photoUrl: { type: String, default: '' },
    whatsapp: { type: String },
    bio: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Operator', OperatorSchema);

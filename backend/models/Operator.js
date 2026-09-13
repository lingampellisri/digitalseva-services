const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const OperatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    phone: { type: String, required: true, unique: true },
    password: { type: String, default: 'Operator@123' },
    email: { type: String },
    address: { type: String },
    photoUrl: { type: String, default: '' },
    whatsapp: { type: String },
    whatsappGroupLink: { type: String, default: '' },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    role: {
        type: String,
        enum: ['admin', 'senior_operator', 'operator', 'trainee_operator'],
        default: 'operator'
    },
    permissions: {
        canUpdateStatus: { type: Boolean, default: true },
        canAddNotes: { type: Boolean, default: true },
        canViewAllRequests: { type: Boolean, default: false },
        canExportContacts: { type: Boolean, default: false },
        canEditProfile: { type: Boolean, default: true }
    },
    totalAssigned: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    lastAssignedAt: { type: Date, default: null }
}, { timestamps: true });

// Hash password before saving
OperatorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
OperatorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Never return password in JSON
OperatorSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('Operator', OperatorSchema);

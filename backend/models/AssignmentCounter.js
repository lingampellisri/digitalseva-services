const mongoose = require('mongoose');

const AssignmentCounterSchema = new mongoose.Schema({
    lastAssignedIndex: { type: Number, default: -1 },
    totalRequests: { type: Number, default: 0 }
});

module.exports = mongoose.model('AssignmentCounter', AssignmentCounterSchema);

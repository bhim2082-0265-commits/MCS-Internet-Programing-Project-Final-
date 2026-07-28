const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  providerName: { type: String, required: true },
  policyNumber: { type: String, required: true },
  groupNumber: String,
  coverageType: { type: String, enum: ['Individual', 'Family', 'Group'], default: 'Individual' },
  coveragePercent: { type: Number, default: 0 },
  maxCoverage: { type: Number, default: 0 },
  startDate: Date,
  expiryDate: Date,
  contactPhone: String,
  contactEmail: String,
  status: { type: String, enum: ['Active', 'Expired', 'Cancelled'], default: 'Active' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Insurance', insuranceSchema);

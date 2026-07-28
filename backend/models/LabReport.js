const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  reportNumber: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorName: { type: String, required: true },
  department: String,
  tests: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' },
    testName: String,
    result: String,
    unit: String,
    normalRange: String,
    status: { type: String, enum: ['Pending', 'In-Progress', 'Completed', 'Cancelled'], default: 'Pending' },
    notes: String
  }],
  overallStatus: { type: String, enum: ['Pending', 'In-Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  sampleCollectedAt: Date,
  completedAt: Date,
  notes: String,
  fileUrl: String
}, { timestamps: true });

labReportSchema.pre('save', async function (next) {
  if (!this.reportNumber) {
    const count = await mongoose.model('LabReport').countDocuments();
    this.reportNumber = `LR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LabReport', labReportSchema);

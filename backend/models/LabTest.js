const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  testCode: { type: String, unique: true },
  category: { type: String, enum: ['Blood', 'Urine', 'Stool', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Echo', 'Endoscopy', 'Biopsy', 'Pathology', 'Microbiology', 'Biochemistry', 'Hematology', 'Other'], required: true },
  department: { type: String },
  description: String,
  normalRange: String,
  unit: String,
  price: { type: Number, required: true },
  turnaroundTime: { type: String, default: '24 hours' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);

const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  doctorName: { type: String, required: true },
  department: String,
  visitDate: { type: Date, default: Date.now },
  chiefComplaint: String,
  symptoms: [String],
  diagnosis: String,
  treatmentPlan: String,
  progressNotes: String,
  vitals: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number
  },
  labReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabReport' }],
  vaccinations: [{
    name: String,
    date: Date,
    batch: String,
    nextDose: Date,
    notes: String
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  followUpDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

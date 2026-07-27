const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  route: {
    type: String,
    enum: ['Oral', 'IV', 'IM', 'Topical', 'Inhalation', 'Other'],
    default: 'Oral'
  },
  duration: {
    type: String,
    required: true
  },
  instructions: {
    type: String
  }
});

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctorName: {
    type: String,
    required: true
  },
  nmcNumber: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  medications: [medicationSchema],
  notes: {
    type: String
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);

const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  recordedBy: {
    type: String,
    required: true
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  heartRate: {
    type: Number
  },
  temperature: {
    type: Number
  },
  spo2: {
    type: Number
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  respiratoryRate: {
    type: Number
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vitals', vitalsSchema);

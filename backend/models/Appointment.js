const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    enum: ['Administration', 'Anesthesiology', 'Cardiology', 'Cardiovascular Surgery', 'Dermatology', 'Emergency Medicine', 'Endocrinology', 'Gastroenterology', 'General Medicine', 'General Surgery', 'Geriatric Medicine', 'Gynecology', 'Hematology', 'Internal Medicine', 'Neurology', 'Neurosurgery', 'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Plastic Surgery', 'Psychiatry', 'Pulmonology', 'Radiology', 'Reception', 'Urology'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Arrived', 'In-Consultation', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  reason: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

appointmentSchema.index({ date: 1, doctorName: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

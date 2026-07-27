const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  mrn: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    province: String
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  allergies: [String],
  chronicConditions: [String]
}, {
  timestamps: true
});

patientSchema.pre('save', async function(next) {
  if (!this.mrn) {
    const count = await mongoose.model('Patient').countDocuments();
    this.mrn = `LIN-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);

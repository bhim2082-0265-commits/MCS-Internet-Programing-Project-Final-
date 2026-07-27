const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nmcNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    minlength: 6
  },
  phone: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  specialty: {
    type: String
  },
  hospital: {
    type: String,
    default: 'Lincoln International Hospital and Research Center'
  },
  location: {
    type: String,
    default: 'Dhobidhara, Kathmandu, Nepal'
  },
  consultationFee: {
    type: Number,
    default: 1000
  },
  role: {
    type: String,
    enum: ['doctor', 'admin', 'receptionist'],
    default: 'doctor'
  },
  schedule: {
    monday: { start: String, end: String, available: { type: Boolean, default: false } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: false } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: false } },
    thursday: { start: String, end: String, available: { type: Boolean, default: false } },
    friday: { start: String, end: String, available: { type: Boolean, default: false } },
    saturday: { start: String, end: String, available: { type: Boolean, default: true } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSeedData: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

doctorSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Doctor', doctorSchema);

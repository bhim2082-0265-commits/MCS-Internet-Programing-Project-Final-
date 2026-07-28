const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: String,
  role: { type: String, enum: ['Doctor', 'Nurse', 'Lab Technician', 'Pharmacist', 'Accountant', 'Receptionist', 'Admin', 'Cleaner', 'Security', 'Other'], required: true },
  department: String,
  designation: String,
  qualification: String,
  dateOfJoining: { type: Date, default: Date.now },
  salary: Number,
  shift: { type: String, enum: ['Morning', 'Afternoon', 'Night', 'Rotating'], default: 'Morning' },
  address: {
    street: String,
    city: String,
    district: String,
    province: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

employeeSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);

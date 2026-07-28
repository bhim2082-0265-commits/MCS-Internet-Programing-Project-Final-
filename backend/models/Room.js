const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], default: 'Available' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  admittedAt: Date,
  dischargedAt: Date
});

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, default: 1 },
  type: { type: String, enum: ['General', 'Semi-Private', 'Private', 'VIP', 'ICU', 'Emergency', 'Operation', 'Maternity', 'Pediatric', 'Isolation'], required: true },
  department: String,
  capacity: { type: Number, default: 1 },
  beds: [bedSchema],
  ratePerDay: { type: Number, required: true },
  amenities: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);

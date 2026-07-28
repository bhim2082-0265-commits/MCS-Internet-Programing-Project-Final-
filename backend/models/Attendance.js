const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-Day', 'On-Leave', 'Holiday'], default: 'Present' },
  shift: { type: String, enum: ['Morning', 'Afternoon', 'Night'] },
  hoursWorked: Number,
  notes: String
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

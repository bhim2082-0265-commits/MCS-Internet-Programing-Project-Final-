const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
  userModel: { type: String, default: 'Doctor' },
  type: { type: String, enum: ['Appointment Reminder', 'Bill Due', 'Prescription Refill', 'Lab Result', 'Stock Alert', 'General', 'Admission', 'Discharge'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

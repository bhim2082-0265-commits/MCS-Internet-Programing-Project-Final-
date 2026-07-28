const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId },
  userName: String,
  role: String,
  action: { type: String, enum: ['Create', 'Read', 'Update', 'Delete', 'Login', 'Logout', 'Export', 'Adjust', 'Pay', 'Cancel'], required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: String,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

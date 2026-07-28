const AuditLog = require('../models/AuditLog');

exports.log = async (data) => {
  try {
    const logEntry = new AuditLog(data);
    await logEntry.save();
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { userId, action, resource, startDate, endDate } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(500);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await AuditLog.countDocuments({ createdAt: { $gte: today } });
    const totalLogs = await AuditLog.countDocuments();
    const byAction = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byResource = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ todayLogs, totalLogs, byAction, byResource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

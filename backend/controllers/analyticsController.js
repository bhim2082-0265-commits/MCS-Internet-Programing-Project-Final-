const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');

exports.getDailyRevenue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: 'Paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalVAT: { $sum: '$taxAmount' },
          invoiceCount: { $sum: 1 },
          avgInvoice: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.json({
      date: today.toISOString().split('T')[0],
      revenue: result[0] || { totalRevenue: 0, totalVAT: 0, invoiceCount: 0, avgInvoice: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const result = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'Paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          dailyRevenue: { $sum: '$totalAmount' },
          dailyVAT: { $sum: '$taxAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalResult = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'Paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalVAT: { $sum: '$taxAmount' },
          totalInvoices: { $sum: 1 }
        }
      }
    ]);

    res.json({
      monthly: result,
      summary: totalResult[0] || { totalRevenue: 0, totalVAT: 0, totalInvoices: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      todayAppointments,
      pendingAppointments,
      completedToday,
      todayRevenue,
      totalPrescriptions
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'Scheduled' }),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'Completed' }),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Prescription.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } })
    ]);

    res.json({
      totalPatients,
      todayAppointments,
      pendingAppointments,
      completedToday,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalPrescriptions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const result = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$doctorName',
          totalAppointments: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDiseaseStats = async (req, res) => {
  try {
    const result = await Prescription.aggregate([
      {
        $group: {
          _id: '$diagnosis',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

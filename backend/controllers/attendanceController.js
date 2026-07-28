const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.checkIn = async (req, res) => {
  try {
    const { employeeId, shift, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let attendance = await Attendance.findOne({ employeeId, date: today });
    if (attendance) return res.status(400).json({ message: 'Already checked in today' });
    attendance = new Attendance({
      employeeId,
      date: today,
      checkIn: new Date(),
      shift: shift || 'Morning',
      status: 'Present',
      notes
    });
    await attendance.save();
    const populated = await attendance.populate('employeeId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await Attendance.findOne({ employeeId, date: today });
    if (!attendance) return res.status(404).json({ message: 'No check-in found for today' });
    if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out' });
    attendance.checkOut = new Date();
    attendance.hoursWorked = Math.round(((attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60)) * 100) / 100;
    await attendance.save();
    const populated = await attendance.populate('employeeId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) query.status = status;
    const records = await Attendance.find(query).populate('employeeId').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markLeave = async (req, res) => {
  try {
    const { employeeId, date, notes } = req.body;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    let attendance = await Attendance.findOne({ employeeId, date: d });
    if (attendance) {
      attendance.status = 'On-Leave';
      attendance.notes = notes;
    } else {
      attendance = new Attendance({ employeeId, date: d, status: 'On-Leave', notes });
    }
    await attendance.save();
    const populated = await attendance.populate('employeeId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDailySummary = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const records = await Attendance.find({ date: { $gte: date, $lte: end } }).populate('employeeId');
    const total = await Employee.countDocuments({ isActive: true });
    const present = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const absent = total - records.length;
    const onLeave = records.filter(r => r.status === 'On-Leave').length;
    res.json({ date, total, present, absent, onLeave, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

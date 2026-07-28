const LabReport = require('../models/LabReport');

exports.createReport = async (req, res) => {
  try {
    const report = new LabReport(req.body);
    await report.save();
    const populated = await report.populate('patientId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { patientId, doctorName, status, startDate, endDate } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };
    if (status) query.overallStatus = status;
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const reports = await LabReport.find(query).populate('patientId').sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await LabReport.findById(req.params.id).populate('patientId');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await LabReport.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patientId');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTestResult = async (req, res) => {
  try {
    const { testIndex, result, status, notes } = req.body;
    const report = await LabReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (testIndex >= 0 && testIndex < report.tests.length) {
      if (result !== undefined) report.tests[testIndex].result = result;
      if (status !== undefined) report.tests[testIndex].status = status;
      if (notes !== undefined) report.tests[testIndex].notes = notes;
      const allDone = report.tests.every(t => t.status === 'Completed');
      const anyStarted = report.tests.some(t => t.status === 'In-Progress' || t.status === 'Completed');
      if (allDone) { report.overallStatus = 'Completed'; report.completedAt = new Date(); }
      else if (anyStarted) { report.overallStatus = 'In-Progress'; }
    }
    await report.save();
    const populated = await report.populate('patientId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await LabReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

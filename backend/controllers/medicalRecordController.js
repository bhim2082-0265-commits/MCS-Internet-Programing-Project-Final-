const MedicalRecord = require('../models/MedicalRecord');

exports.createRecord = async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();
    const populated = await record.populate('patientId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const { patientId, doctorName, startDate, endDate } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };
    if (startDate && endDate) {
      query.visitDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const records = await MedicalRecord.find(query).populate('patientId').sort({ visitDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate('patientId');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('patientId');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addVaccination = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    record.vaccinations.push(req.body);
    await record.save();
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

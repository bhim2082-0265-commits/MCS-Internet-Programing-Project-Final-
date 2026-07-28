const Insurance = require('../models/Insurance');

exports.createInsurance = async (req, res) => {
  try {
    const insurance = new Insurance(req.body);
    await insurance.save();
    res.status(201).json(insurance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getInsuranceByPatient = async (req, res) => {
  try {
    const records = await Insurance.find({ patientId: req.params.patientId });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });
    res.json(insurance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteInsurance = async (req, res) => {
  try {
    await Insurance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Insurance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllInsurance = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const records = await Insurance.find(query).populate('patientId').sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

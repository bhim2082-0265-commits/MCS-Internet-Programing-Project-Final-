const Vitals = require('../models/Vitals');

exports.createVitals = async (req, res) => {
  try {
    const vitals = new Vitals({
      ...req.body,
      recordedBy: req.user?.name || req.body.recordedBy
    });
    await vitals.save();
    const populated = await vitals.populate('patientId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getVitalsByPatient = async (req, res) => {
  try {
    const vitals = await Vitals.find({ patientId: req.params.patientId })
      .populate('patientId')
      .sort({ createdAt: -1 });
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVitalsById = async (req, res) => {
  try {
    const vitals = await Vitals.findById(req.params.id).populate('patientId');
    if (!vitals) {
      return res.status(404).json({ message: 'Vitals record not found' });
    }
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVitals = async (req, res) => {
  try {
    const vitals = await Vitals.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patientId');
    if (!vitals) {
      return res.status(404).json({ message: 'Vitals record not found' });
    }
    res.json(vitals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteVitals = async (req, res) => {
  try {
    const vitals = await Vitals.findByIdAndDelete(req.params.id);
    if (!vitals) {
      return res.status(404).json({ message: 'Vitals record not found' });
    }
    res.json({ message: 'Vitals record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

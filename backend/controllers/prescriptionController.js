const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');

exports.createPrescription = async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    const populated = await prescription.populate('patientId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const { patientId, doctorName } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (doctorName) query.doctorName = doctorName;
    const prescriptions = await Prescription.find(query)
      .populate('patientId')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate('patientId');
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id).populate('patientId');
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    const pdfBuffer = await generatePrescriptionPDF(prescription, prescription.patientId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Prescription-${prescription.patientId.mrn}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patientId');
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json(prescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

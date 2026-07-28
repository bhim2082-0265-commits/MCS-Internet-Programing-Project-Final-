const Admission = require('../models/Admission');
const Room = require('../models/Room');

exports.createAdmission = async (req, res) => {
  try {
    const admission = new Admission(req.body);
    await admission.save();
    if (req.body.roomId && req.body.bedNumber) {
      const room = await Room.findById(req.body.roomId);
      if (room) {
        const bedIdx = room.beds.findIndex(b => b.bedNumber === req.body.bedNumber);
        if (bedIdx >= 0) {
          room.beds[bedIdx].status = 'Occupied';
          room.beds[bedIdx].patientId = req.body.patientId;
          room.beds[bedIdx].admittedAt = new Date();
          await room.save();
        }
      }
    }
    const populated = await admission.populate('patientId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const { patientId, status, doctorName } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };
    const admissions = await Admission.find(query).populate('patientId').sort({ createdAt: -1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id).populate('patientId');
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.dischargePatient = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    admission.status = 'Discharged';
    admission.dischargeDate = new Date();
    if (req.body.notes) admission.notes = req.body.notes;
    if (req.body.totalCharges) admission.totalCharges = req.body.totalCharges;
    await admission.save();
    if (admission.roomId && admission.bedNumber) {
      const room = await Room.findById(admission.roomId);
      if (room) {
        const bedIdx = room.beds.findIndex(b => b.bedNumber === admission.bedNumber);
        if (bedIdx >= 0) {
          room.beds[bedIdx].status = 'Available';
          room.beds[bedIdx].patientId = undefined;
          room.beds[bedIdx].dischargedAt = new Date();
          await room.save();
        }
      }
    }
    const populated = await admission.populate('patientId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAdmission = async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admission deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

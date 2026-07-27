const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorName, date, time, department } = req.body;
    
    const existingAppointment = await Appointment.findOne({
      doctorName,
      date: new Date(date),
      time,
      status: { $nin: ['Cancelled'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked for this doctor' });
    }
    
    const appointment = new Appointment(req.body);
    await appointment.save();
    const populated = await appointment.populate('patientId');
    
    const io = req.app.get('io');
    if (io) {
      io.to('reception').emit('queue_updated', { type: 'new_appointment', appointment: populated });
    }
    
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { date, doctor, status, department } = req.query;
    let query = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    if (doctor) query.doctorName = doctor;
    if (status) query.status = status;
    if (department) query.department = department;
    const appointments = await Appointment.find(query)
      .populate('patientId')
      .sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('patientId')
      .sort({ time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patientId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const io = req.app.get('io');
    if (io) {
      io.to('reception').emit('queue_updated', { type: 'status_update', appointment });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

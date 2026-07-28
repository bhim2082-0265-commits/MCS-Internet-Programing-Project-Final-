const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');

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
    const oldAppointment = await Appointment.findById(req.params.id).populate('patientId');
    if (!oldAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const wasNotCompleted = oldAppointment.status !== 'Completed';
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patientId');

    const io = req.app.get('io');
    if (io) {
      io.to('reception').emit('queue_updated', { type: 'status_update', appointment });
    }

    if (wasNotCompleted && req.body.status === 'Completed') {
      const existingInvoice = await Invoice.findOne({ appointmentId: appointment._id });
      if (!existingInvoice) {
        let consultationFee = 1000;
        try {
          const doctor = await Doctor.findOne({ name: appointment.doctorName });
          if (doctor && doctor.consultationFee) {
            consultationFee = doctor.consultationFee;
          }
        } catch (e) {}

        const taxRate = 13;
        const subtotal = consultationFee;
        const taxableAmount = consultationFee;
        const taxAmount = (taxableAmount * taxRate) / 100;
        const totalAmount = subtotal + taxAmount;

        const invoice = new Invoice({
          patientId: appointment.patientId._id,
          doctorName: appointment.doctorName,
          doctorDepartment: appointment.department,
          appointmentId: appointment._id,
          items: [
            {
              description: `Consultation - ${appointment.doctorName} (${appointment.department})`,
              quantity: 1,
              unitPrice: consultationFee,
              total: consultationFee,
              isTaxable: true,
              category: 'Consultation'
            }
          ],
          subtotal,
          taxableAmount,
          taxRate,
          taxAmount,
          totalAmount,
          notes: `Auto-generated invoice for appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`
        });

        await invoice.save();

        try {
          const populatedInvoice = await invoice.populate('patientId');
          const patient = populatedInvoice.patientId;
          const pdfBuffer = await generateInvoicePDF(populatedInvoice, patient);
          const invoicesDir = path.join(__dirname, '..', 'invoices');
          if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
          const fileName = `${populatedInvoice.invoiceNumber}_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
          fs.writeFileSync(path.join(invoicesDir, fileName), pdfBuffer);
          invoice.pdfFile = fileName;
          await invoice.save();
        } catch (pdfErr) {
          console.error('PDF save error:', pdfErr.message);
        }

        if (io) {
          io.to('reception').emit('queue_updated', {
            type: 'auto_invoice_created',
            appointment,
            invoice: await invoice.populate('patientId')
          });
        }
      }
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

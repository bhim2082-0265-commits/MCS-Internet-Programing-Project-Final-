const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getTodayAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/today', getTodayAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;

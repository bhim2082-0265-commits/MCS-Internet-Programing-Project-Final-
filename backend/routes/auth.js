const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllDoctors, getDoctorById, getDoctorSchedule, getDepartments, getHospitals, updateDoctor, forgotPassword, resetPassword } = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', auth, getProfile);
router.get('/doctors', getAllDoctors);
router.get('/doctors/departments', getDepartments);
router.get('/doctors/hospitals', getHospitals);
router.get('/doctors/:id', getDoctorById);
router.get('/doctors/:id/schedule', getDoctorSchedule);
router.put('/doctors/:id', auth, authorize('admin'), updateDoctor);

module.exports = router;

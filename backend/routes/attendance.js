const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance, markLeave, getDailySummary } = require('../controllers/attendanceController');
const { auth } = require('../middleware/auth');

router.post('/check-in', auth, checkIn);
router.post('/check-out', auth, checkOut);
router.get('/', auth, getAttendance);
router.get('/daily', auth, getDailySummary);
router.post('/leave', auth, markLeave);

module.exports = router;

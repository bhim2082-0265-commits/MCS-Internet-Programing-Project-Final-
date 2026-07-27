const express = require('express');
const router = express.Router();
const { getDailyRevenue, getMonthlyRevenue, getDashboardStats, getDoctorPerformance, getDiseaseStats } = require('../controllers/analyticsController');
const { auth, authorize } = require('../middleware/auth');

router.get('/daily-revenue', auth, getDailyRevenue);
router.get('/monthly-revenue', auth, getMonthlyRevenue);
router.get('/dashboard', auth, getDashboardStats);
router.get('/doctor-performance', auth, authorize('admin'), getDoctorPerformance);
router.get('/disease-stats', auth, getDiseaseStats);

module.exports = router;

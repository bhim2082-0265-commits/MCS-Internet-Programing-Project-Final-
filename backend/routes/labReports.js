const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportById, updateReport, updateTestResult, deleteReport } = require('../controllers/labReportController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createReport);
router.get('/', auth, getReports);
router.get('/:id', auth, getReportById);
router.put('/:id', auth, updateReport);
router.put('/:id/test-result', auth, updateTestResult);
router.delete('/:id', auth, deleteReport);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createAdmission, getAdmissions, getAdmissionById, dischargePatient, deleteAdmission } = require('../controllers/admissionController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createAdmission);
router.get('/', auth, getAdmissions);
router.get('/:id', auth, getAdmissionById);
router.put('/:id/discharge', auth, dischargePatient);
router.delete('/:id', auth, deleteAdmission);

module.exports = router;

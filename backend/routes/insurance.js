const express = require('express');
const router = express.Router();
const { createInsurance, getInsuranceByPatient, updateInsurance, deleteInsurance, getAllInsurance } = require('../controllers/insuranceController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createInsurance);
router.get('/', auth, getAllInsurance);
router.get('/patient/:patientId', auth, getInsuranceByPatient);
router.put('/:id', auth, updateInsurance);
router.delete('/:id', auth, deleteInsurance);

module.exports = router;

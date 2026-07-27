const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  generatePDF,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createPrescription);
router.get('/', auth, getPrescriptions);
router.get('/:id', auth, getPrescriptionById);
router.get('/:id/pdf', auth, generatePDF);
router.put('/:id', auth, updatePrescription);
router.delete('/:id', auth, deletePrescription);

module.exports = router;

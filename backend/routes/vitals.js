const express = require('express');
const router = express.Router();
const { createVitals, getVitalsByPatient, getVitalsById, updateVitals, deleteVitals } = require('../controllers/vitalsController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createVitals);
router.get('/patient/:patientId', auth, getVitalsByPatient);
router.get('/:id', auth, getVitalsById);
router.put('/:id', auth, updateVitals);
router.delete('/:id', auth, deleteVitals);

module.exports = router;

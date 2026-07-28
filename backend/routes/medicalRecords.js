const express = require('express');
const router = express.Router();
const { createRecord, getRecords, getRecordById, updateRecord, addVaccination, deleteRecord } = require('../controllers/medicalRecordController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createRecord);
router.get('/', auth, getRecords);
router.get('/:id', auth, getRecordById);
router.put('/:id', auth, updateRecord);
router.post('/:id/vaccination', auth, addVaccination);
router.delete('/:id', auth, deleteRecord);

module.exports = router;

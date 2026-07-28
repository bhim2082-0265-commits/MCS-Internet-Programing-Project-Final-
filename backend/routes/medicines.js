const express = require('express');
const router = express.Router();
const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicineStats
} = require('../controllers/medicineController');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, getMedicineStats);
router.post('/', auth, createMedicine);
router.get('/', auth, getMedicines);
router.get('/:id', auth, getMedicineById);
router.put('/:id', auth, updateMedicine);
router.delete('/:id', auth, deleteMedicine);

module.exports = router;

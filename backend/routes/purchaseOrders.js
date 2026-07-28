const express = require('express');
const router = express.Router();
const { createPO, getPOs, getPOById, updatePO, deletePO } = require('../controllers/purchaseOrderController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createPO);
router.get('/', auth, getPOs);
router.get('/:id', auth, getPOById);
router.put('/:id', auth, updatePO);
router.delete('/:id', auth, deletePO);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createItem, getItems, getItemById, updateItem, deleteItem, adjustStock, getStats } = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createItem);
router.get('/', auth, getItems);
router.get('/stats', auth, getStats);
router.get('/:id', auth, getItemById);
router.put('/:id', auth, updateItem);
router.put('/:id/adjust-stock', auth, adjustStock);
router.delete('/:id', auth, deleteItem);

module.exports = router;

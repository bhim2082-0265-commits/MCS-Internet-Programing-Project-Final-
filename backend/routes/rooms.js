const express = require('express');
const router = express.Router();
const { createRoom, getRooms, getRoomById, updateRoom, updateBed, deleteRoom, getAvailability } = require('../controllers/roomController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createRoom);
router.get('/', auth, getRooms);
router.get('/availability', auth, getAvailability);
router.get('/:id', auth, getRoomById);
router.put('/:id', auth, updateRoom);
router.put('/:id/bed', auth, updateBed);
router.delete('/:id', auth, deleteRoom);

module.exports = router;

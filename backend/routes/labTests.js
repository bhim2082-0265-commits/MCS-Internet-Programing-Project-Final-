const express = require('express');
const router = express.Router();
const { createTest, getTests, getTestById, updateTest, deleteTest } = require('../controllers/labTestController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createTest);
router.get('/', auth, getTests);
router.get('/:id', auth, getTestById);
router.put('/:id', auth, updateTest);
router.delete('/:id', auth, deleteTest);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getLogs, getStats } = require('../controllers/auditLogController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, getLogs);
router.get('/stats', auth, getStats);

module.exports = router;

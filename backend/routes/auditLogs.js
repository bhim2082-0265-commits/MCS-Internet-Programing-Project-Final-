const express = require('express');
const router = express.Router();
const { getLogs, getStats } = require('../controllers/auditLogController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin'), getLogs);
router.get('/stats', auth, authorize('admin'), getStats);

module.exports = router;

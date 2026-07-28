const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createNotification);
router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/read-all', auth, markAllAsRead);
router.put('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteNotification);

module.exports = router;

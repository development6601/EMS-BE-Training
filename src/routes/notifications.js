const express = require('express');
const NotificationController = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// User routes (require user role)
router.get('/', authorize(['user']), NotificationController.getNotifications);
router.get('/stats', authorize(['user']), NotificationController.getNotificationStats);
router.get('/unread-count', authorize(['user']), NotificationController.getUnreadCount);
router.get('/:id', authorize(['user']), NotificationController.getNotificationById);
router.put('/:id/read', authorize(['user']), NotificationController.markAsRead);
router.put('/mark-all-read', authorize(['user']), NotificationController.markAllAsRead);
router.delete('/:id', authorize(['user']), NotificationController.deleteNotification);

module.exports = router;

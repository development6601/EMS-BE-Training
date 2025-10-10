const NotificationService = require('../services/notificationService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class NotificationController {
  // @desc    Get user notifications
  // @route   GET /api/notifications
  // @access  Private (User)
  static getNotifications = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.userId;
      const { page, limit, type, isRead, getAll } = req.query;

      // Default behavior: get latest 10 notifications
      if (!getAll && !page && !limit) {
        const notifications = await NotificationService.getLatestNotifications(userId, 10);
        
        return res.status(200).json({
          success: true,
          message: 'Latest notifications retrieved successfully',
          data: {
            notifications,
            pagination: null,
            filters: { getAll: false, limit: 10 },
          },
        });
      }

      // Advanced filtering and pagination
      const result = await NotificationService.getUserNotifications(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        type,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        getAll: getAll === 'true',
      });

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Get notifications error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get notification statistics
  // @route   GET /api/notifications/stats
  // @access  Private (User)
  static getNotificationStats = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.userId;
      const stats = await NotificationService.getNotificationStats(userId);

      res.status(200).json({
        success: true,
        message: 'Notification statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error(`Get notification stats error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get unread notifications count
  // @route   GET /api/notifications/unread-count
  // @access  Private (User)
  static getUnreadCount = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.userId;
      const count = await NotificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        message: 'Unread count retrieved successfully',
        data: { unreadCount: count },
      });
    } catch (error) {
      logger.error(`Get unread count error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Mark notification as read
  // @route   PUT /api/notifications/:id/read
  // @access  Private (User)
  static markAsRead = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const notification = await NotificationService.markAsRead(id, userId);

      logger.info(`Notification ${id} marked as read by user ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification },
      });
    } catch (error) {
      logger.error(`Mark notification as read error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Mark all notifications as read
  // @route   PUT /api/notifications/mark-all-read
  // @access  Private (User)
  static markAllAsRead = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.userId;
      const result = await NotificationService.markAllAsRead(userId);

      logger.info(`All notifications marked as read by user ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      logger.error(`Mark all notifications as read error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Delete notification
  // @route   DELETE /api/notifications/:id
  // @access  Private (User)
  static deleteNotification = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const result = await NotificationService.deleteNotification(id, userId);

      logger.info(`Notification ${id} deleted by user ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error(`Delete notification error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get notification by ID
  // @route   GET /api/notifications/:id
  // @access  Private (User)
  static getNotificationById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // This would require a new service method
      const Notification = require('../models/Notification');
      const notification = await Notification.findOne({
        _id: id,
        userId,
      })
        .populate('eventId', 'title eventDate eventTime location')
        .populate('participantId', 'status appliedAt');

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification retrieved successfully',
        data: { notification },
      });
    } catch (error) {
      logger.error(`Get notification by ID error: ${error.message}`);
      throw error;
    }
  });
}

module.exports = NotificationController;

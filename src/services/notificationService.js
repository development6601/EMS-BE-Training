const Notification = require('../models/Notification');
const User = require('../models/User');
const Event = require('../models/Event');
const EventParticipant = require('../models/EventParticipant');

class NotificationService {
  // Create a new notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      throw error;
    }
  }

  // Get user notifications with pagination
  static async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        type,
        isRead,
        getAll = false,
      } = options;

      const query = { userId };

      // Add filters
      if (type) {
        query.type = type;
      }
      if (isRead !== undefined) {
        query.isRead = isRead;
      }

      const skip = getAll ? 0 : (page - 1) * limit;
      const actualLimit = getAll ? 0 : limit;

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .populate('eventId', 'title eventDate eventTime location')
          .populate('participantId', 'status appliedAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(actualLimit),
        Notification.countDocuments(query),
      ]);

      return {
        notifications,
        pagination: getAll ? null : {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        filters: {
          type,
          isRead,
          getAll,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get latest 10 notifications for user (default behavior)
  static async getLatestNotifications(userId, limit = 10) {
    try {
      const notifications = await Notification.find({ userId })
        .populate('eventId', 'title eventDate eventTime location')
        .populate('participantId', 'status appliedAt')
        .sort({ createdAt: -1 })
        .limit(limit);

      return notifications;
    } catch (error) {
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({ userId, isRead: false });
      return count;
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
      }

      return notification;
    } catch (error) {
      throw error;
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { 
          isRead: true, 
          readAt: new Date() 
        }
      );

      return {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} notifications marked as read`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Create participant approval notification
  static async createParticipantApprovalNotification(participantId) {
    try {
      const participant = await EventParticipant.findById(participantId)
        .populate('userId', 'firstName lastName email')
        .populate('eventId', 'title eventDate eventTime location');

      if (!participant) {
        throw new Error('Participant not found');
      }

      const notification = await Notification.createParticipantApprovalNotification(
        participant.userId._id,
        participant.eventId._id,
        participantId,
        participant.eventId.title
      );

      return notification;
    } catch (error) {
      throw error;
    }
  }

  // Create participant rejection notification
  static async createParticipantRejectionNotification(participantId, rejectionReason = '') {
    try {
      const participant = await EventParticipant.findById(participantId)
        .populate('userId', 'firstName lastName email')
        .populate('eventId', 'title eventDate eventTime location');

      if (!participant) {
        throw new Error('Participant not found');
      }

      const notification = await Notification.createParticipantRejectionNotification(
        participant.userId._id,
        participant.eventId._id,
        participantId,
        participant.eventId.title,
        rejectionReason
      );

      return notification;
    } catch (error) {
      throw error;
    }
  }

  // Get notification statistics for user
  static async getNotificationStats(userId) {
    try {
      const [total, unread, byType] = await Promise.all([
        Notification.countDocuments({ userId }),
        Notification.countDocuments({ userId, isRead: false }),
        Notification.aggregate([
          { $match: { userId: new require('mongoose').Types.ObjectId(userId) } },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      return {
        total,
        unread,
        read: total - unread,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      throw error;
    }
  }

  // Clean up old notifications (optional utility method)
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true,
      });

      return {
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} old notifications cleaned up`,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NotificationService;

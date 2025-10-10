const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: ['participant_approved', 'participant_rejected', 'event_created', 'event_updated', 'event_cancelled', 'system'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    // Related entities for context
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventParticipant',
    },
    // Additional data for different notification types
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Priority level for notifications
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // Action URL for frontend navigation
    actionUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function () {
  const now = new Date();
  const diffInHours = Math.floor((now - this.createdAt) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
});

// Static method to create participant approval notification
notificationSchema.statics.createParticipantApprovalNotification = async function (userId, eventId, participantId, eventTitle) {
  try {
    const notification = new this({
      userId,
      type: 'participant_approved',
      title: 'Event Application Approved',
      message: `Your application for "${eventTitle}" has been approved! You can now attend the event.`,
      eventId,
      participantId,
      priority: 'high',
      actionUrl: `/events/${eventId}`,
      metadata: {
        eventTitle,
        status: 'approved',
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

// Static method to create participant rejection notification
notificationSchema.statics.createParticipantRejectionNotification = async function (userId, eventId, participantId, eventTitle, rejectionReason) {
  try {
    const notification = new this({
      userId,
      type: 'participant_rejected',
      title: 'Event Application Rejected',
      message: `Your application for "${eventTitle}" has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      eventId,
      participantId,
      priority: 'medium',
      actionUrl: `/events/${eventId}`,
      metadata: {
        eventTitle,
        status: 'rejected',
        rejectionReason,
      },
    });

    await notification.save();
    return notification;
  } catch (error) {
    throw error;
  }
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function (userId) {
  try {
    const count = await this.countDocuments({ userId, isRead: false });
    return count;
  } catch (error) {
    throw error;
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function () {
  try {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();
      await this.save();
    }
    return this;
  } catch (error) {
    throw error;
  }
};

// Transform JSON output
notificationSchema.methods.toJSON = function () {
  const notificationObject = this.toObject();
  
  // Add virtual fields
  notificationObject.age = this.age;
  
  return notificationObject;
};

module.exports = mongoose.model('Notification', notificationSchema);

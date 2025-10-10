const mongoose = require('mongoose');

const eventParticipantSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique participation per user per event
eventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Indexes for better query performance
eventParticipantSchema.index({ eventId: 1 });
eventParticipantSchema.index({ userId: 1 });
eventParticipantSchema.index({ status: 1 });
eventParticipantSchema.index({ appliedAt: -1 });

// Pre-save middleware to validate participation
eventParticipantSchema.pre('save', async function (next) {
  try {
    // Check if user is trying to join the same event multiple times
    if (this.isNew) {
      const existingParticipation = await this.constructor.findOne({
        eventId: this.eventId,
        userId: this.userId,
      });

      if (existingParticipation) {
        return next(new Error('User has already applied for this event'));
      }

      // Check if event exists and is active
      const Event = mongoose.model('Event');
      const event = await Event.findById(this.eventId);
      
      if (!event) {
        return next(new Error('Event not found'));
      }

      if (event.status !== 'active') {
        return next(new Error('Cannot join inactive event'));
      }

      if (event.isFull) {
        return next(new Error('Event is full'));
      }

      if (event.isPast) {
        return next(new Error('Cannot join past event'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update event participant count
eventParticipantSchema.post('save', async function (doc) {
  try {
    const Event = mongoose.model('Event');
    const approvedCount = await this.constructor.countDocuments({
      eventId: doc.eventId,
      status: 'approved',
    });

    await Event.findByIdAndUpdate(doc.eventId, {
      currentParticipants: approvedCount,
    });
  } catch (error) {
    console.error('Error updating event participant count:', error);
  }
});

module.exports = mongoose.model('EventParticipant', eventParticipantSchema);

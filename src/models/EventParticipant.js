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
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    // Additional fields for enhanced functionality
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
      },
      phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, 'Relationship cannot exceed 50 characters'],
      },
    },
    dietaryRequirements: {
      type: String,
      trim: true,
      maxlength: [500, 'Dietary requirements cannot exceed 500 characters'],
    },
    accessibilityNeeds: {
      type: String,
      trim: true,
      maxlength: [500, 'Accessibility needs cannot exceed 500 characters'],
    },
    // Check-in tracking
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one user can only apply once per event
eventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Indexes for better query performance
eventParticipantSchema.index({ eventId: 1 });
eventParticipantSchema.index({ userId: 1 });
eventParticipantSchema.index({ status: 1 });
eventParticipantSchema.index({ appliedAt: -1 });
eventParticipantSchema.index({ reviewedAt: -1 });

// Virtual for checking if participant can reapply
eventParticipantSchema.virtual('canReapply').get(function () {
  // Users can only reapply if they were rejected
  return this.status === 'rejected';
});

// Virtual for checking if participant is active
eventParticipantSchema.virtual('isActive').get(function () {
  return this.status === 'approved';
});

// Pre-save middleware to set reviewedAt when status changes
eventParticipantSchema.pre('save', function (next) {
  // If status is being changed from pending to approved/rejected
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewedAt = new Date();
  }
  next();
});

// Static method to check if user can join event
eventParticipantSchema.statics.canUserJoinEvent = async function (eventId, userId) {
  try {
    // Check if user already applied
    const existingApplication = await this.findOne({ eventId, userId });
    
    if (existingApplication) {
      if (existingApplication.status === 'pending') {
        throw new Error('You have already applied for this event');
      } else if (existingApplication.status === 'approved') {
        throw new Error('You are already approved for this event');
      } else if (existingApplication.status === 'rejected') {
        throw new Error('You were rejected for this event and cannot reapply');
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Static method to get event participant statistics
eventParticipantSchema.statics.getEventParticipantStats = async function (eventId) {
  try {
    const stats = await this.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

// Transform JSON output
eventParticipantSchema.methods.toJSON = function () {
  const participantObject = this.toObject();
  
  // Add virtual fields
  participantObject.canReapply = this.canReapply;
  participantObject.isActive = this.isActive;
  
  return participantObject;
};

module.exports = mongoose.model('EventParticipant', eventParticipantSchema);
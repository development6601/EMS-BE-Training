const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Event title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [1000, 'Event description cannot exceed 1000 characters'],
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'Event date must be in the future',
      },
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: [200, 'Event location cannot exceed 200 characters'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: [1, 'Maximum participants must be at least 1'],
      max: [10000, 'Maximum participants cannot exceed 10000'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Current participants cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      trim: true,
      maxlength: [50, 'Event category cannot exceed 50 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ category: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function () {
  return this.eventDate < new Date();
});

// Pre-save middleware to validate current participants
eventSchema.pre('save', function (next) {
  if (this.currentParticipants > this.maxParticipants) {
    next(new Error('Current participants cannot exceed maximum participants'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Event', eventSchema);

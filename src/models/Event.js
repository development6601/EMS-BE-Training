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
        validator: function(value) {
          return value > new Date();
        },
        message: 'Event date must be in the future',
      },
    },
    eventTime: {
      type: String,
      required: [true, 'Event time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)'],
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
      enum: {
        values: ['conference', 'workshop', 'seminar', 'meetup', 'convention', 'exhibition', 'festival', 'sports', 'music', 'art', 'technology', 'business', 'education', 'health', 'other'],
        message: 'Please select a valid category',
      },
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    imagePublicId: {
      type: String,
      trim: true,
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
    tags: [{
      type: String,
      trim: true,
      maxlength: [20, 'Tag cannot exceed 20 characters'],
    }],
    requirements: {
      type: String,
      trim: true,
      maxlength: [500, 'Requirements cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
      default: 'USD',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    onlineLink: {
      type: String,
      trim: true,
      validate: {
        validator: function(value) {
          if (this.isOnline && !value) {
            return false;
          }
          return true;
        },
        message: 'Online link is required for online events',
      },
    },
    registrationDeadline: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || value < this.eventDate;
        },
        message: 'Registration deadline must be before event date',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eventSchema.index({ eventDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ title: 'text', description: 'text' });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for checking if registration is closed
eventSchema.virtual('isRegistrationClosed').get(function () {
  if (this.registrationDeadline) {
    return new Date() > this.registrationDeadline;
  }
  return false;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function () {
  return this.eventDate > new Date() && this.status === 'active';
});

// Pre-save middleware to update status based on date
eventSchema.pre('save', function (next) {
  const now = new Date();
  
  // Auto-update status to completed if event date has passed
  if (this.eventDate < now && this.status === 'active') {
    this.status = 'completed';
  }
  
  next();
});

// Transform JSON output
eventSchema.methods.toJSON = function () {
  const eventObject = this.toObject();
  
  // Add virtual fields
  eventObject.isFull = this.isFull;
  eventObject.isRegistrationClosed = this.isRegistrationClosed;
  eventObject.isUpcoming = this.isUpcoming;
  
  return eventObject;
};

module.exports = mongoose.model('Event', eventSchema);
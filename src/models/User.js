const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value < new Date();
        },
        message: 'Date of birth must be in the past'
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say'
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    socialMedia: {
      linkedin: {
        type: String,
        trim: true,
        match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/, 'Please provide a valid LinkedIn URL'],
      },
      twitter: {
        type: String,
        trim: true,
        match: [/^https?:\/\/(www\.)?twitter\.com\/.+/, 'Please provide a valid Twitter URL'],
      },
      instagram: {
        type: String,
        trim: true,
        match: [/^https?:\/\/(www\.)?instagram\.com\/.+/, 'Please provide a valid Instagram URL'],
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [100, 'Street address cannot exceed 100 characters'],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, 'City cannot exceed 50 characters'],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, 'State cannot exceed 50 characters'],
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: [10, 'Zip code cannot exceed 10 characters'],
      },
      country: {
        type: String,
        trim: true,
        maxlength: [50, 'Country cannot exceed 50 characters'],
        default: 'United States',
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      language: {
        type: String,
        default: 'en',
        maxlength: [5, 'Language code cannot exceed 5 characters'],
      },
    },
    lastLoginAt: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Transform JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

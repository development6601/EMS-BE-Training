const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage,
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // User registration validation
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required',
      }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required',
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required',
      }),
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Date of birth must be in the past',
      }),
    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer-not-to-say')
      .optional()
      .messages({
        'any.only': 'Gender must be one of: male, female, other, prefer-not-to-say',
      }),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    bio: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Bio cannot exceed 500 characters',
      }),
    website: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .optional()
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
    socialMedia: Joi.object({
      linkedin: Joi.string()
        .pattern(/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid LinkedIn URL',
        }),
      twitter: Joi.string()
        .pattern(/^https?:\/\/(www\.)?twitter\.com\/.+/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid Twitter URL',
        }),
      instagram: Joi.string()
        .pattern(/^https?:\/\/(www\.)?instagram\.com\/.+/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid Instagram URL',
        }),
    }).optional(),
    address: Joi.object({
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      zipCode: Joi.string().max(10).optional(),
      country: Joi.string().max(50).optional(),
    }).optional(),
    preferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      smsNotifications: Joi.boolean().optional(),
      marketingEmails: Joi.boolean().optional(),
      theme: Joi.string().valid('light', 'dark', 'auto').optional(),
      language: Joi.string().max(5).optional(),
    }).optional(),
  }),

  // User login validation
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // Refresh token validation
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required',
      }),
  }),

  // Profile update validation
  updateProfile: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    dateOfBirth: Joi.date()
      .max('now')
      .optional(),
    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer-not-to-say')
      .optional(),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    bio: Joi.string()
      .max(500)
      .optional(),
    website: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .optional(),
    socialMedia: Joi.object({
      linkedin: Joi.string()
        .pattern(/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/)
        .optional(),
      twitter: Joi.string()
        .pattern(/^https?:\/\/(www\.)?twitter\.com\/.+/)
        .optional(),
      instagram: Joi.string()
        .pattern(/^https?:\/\/(www\.)?instagram\.com\/.+/)
        .optional(),
    }).optional(),
    address: Joi.object({
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      zipCode: Joi.string().max(10).optional(),
      country: Joi.string().max(50).optional(),
    }).optional(),
    preferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      smsNotifications: Joi.boolean().optional(),
      marketingEmails: Joi.boolean().optional(),
      theme: Joi.string().valid('light', 'dark', 'auto').optional(),
      language: Joi.string().max(5).optional(),
    }).optional(),
  }),

  // User update validation (Admin only)
  updateUser: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    dateOfBirth: Joi.date()
      .max('now')
      .optional(),
    gender: Joi.string()
      .valid('male', 'female', 'other', 'prefer-not-to-say')
      .optional(),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional(),
    bio: Joi.string()
      .max(500)
      .optional(),
    website: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .optional(),
    socialMedia: Joi.object({
      linkedin: Joi.string()
        .pattern(/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/)
        .optional(),
      twitter: Joi.string()
        .pattern(/^https?:\/\/(www\.)?twitter\.com\/.+/)
        .optional(),
      instagram: Joi.string()
        .pattern(/^https?:\/\/(www\.)?instagram\.com\/.+/)
        .optional(),
    }).optional(),
    address: Joi.object({
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      zipCode: Joi.string().max(10).optional(),
      country: Joi.string().max(50).optional(),
    }).optional(),
    preferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      smsNotifications: Joi.boolean().optional(),
      marketingEmails: Joi.boolean().optional(),
      theme: Joi.string().valid('light', 'dark', 'auto').optional(),
      language: Joi.string().max(5).optional(),
    }).optional(),
  }),

  // Toggle user block validation
  toggleBlock: Joi.object({
    isBlocked: Joi.boolean()
      .required()
      .messages({
        'any.required': 'isBlocked field is required',
      }),
  }),

  // Create event validation
  createEvent: Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Event title must be at least 3 characters long',
        'string.max': 'Event title cannot exceed 100 characters',
        'any.required': 'Event title is required',
      }),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Event description must be at least 10 characters long',
        'string.max': 'Event description cannot exceed 1000 characters',
        'any.required': 'Event description is required',
      }),
    eventDate: Joi.date()
      .greater('now')
      .required()
      .messages({
        'date.greater': 'Event date must be in the future',
        'any.required': 'Event date is required',
      }),
    eventTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid time format (HH:MM)',
        'any.required': 'Event time is required',
      }),
    location: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Event location must be at least 3 characters long',
        'string.max': 'Event location cannot exceed 200 characters',
        'any.required': 'Event location is required',
      }),
    maxParticipants: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.min': 'Maximum participants must be at least 1',
        'number.max': 'Maximum participants cannot exceed 10000',
        'any.required': 'Maximum participants is required',
      }),
    category: Joi.string()
      .valid('conference', 'workshop', 'seminar', 'meetup', 'convention', 'exhibition', 'festival', 'sports', 'music', 'art', 'technology', 'business', 'education', 'health', 'other')
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'any.required': 'Event category is required',
      }),
    tags: Joi.array()
      .items(Joi.string().max(20))
      .max(10)
      .optional()
      .messages({
        'string.max': 'Each tag cannot exceed 20 characters',
        'array.max': 'Maximum 10 tags allowed',
      }),
    requirements: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Requirements cannot exceed 500 characters',
      }),
    price: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Price cannot be negative',
      }),
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD')
      .optional()
      .messages({
        'any.only': 'Please select a valid currency',
      }),
    isOnline: Joi.boolean()
      .optional(),
    onlineLink: Joi.string()
      .uri()
      .when('isOnline', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        'string.uri': 'Please provide a valid URL for online link',
        'any.required': 'Online link is required for online events',
      }),
    registrationDeadline: Joi.date()
      .optional()
      .messages({
        'date.base': 'Please provide a valid registration deadline date',
      }),
  }),

  // Update event validation
  updateEvent: Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .optional(),
    description: Joi.string()
      .min(10)
      .max(1000)
      .optional(),
    eventDate: Joi.date()
      .greater('now')
      .optional(),
    eventTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    location: Joi.string()
      .min(3)
      .max(200)
      .optional(),
    maxParticipants: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .optional(),
    category: Joi.string()
      .valid('conference', 'workshop', 'seminar', 'meetup', 'convention', 'exhibition', 'festival', 'sports', 'music', 'art', 'technology', 'business', 'education', 'health', 'other')
      .optional(),
    tags: Joi.array()
      .items(Joi.string().max(20))
      .max(10)
      .optional(),
    requirements: Joi.string()
      .max(500)
      .optional(),
    price: Joi.number()
      .min(0)
      .optional(),
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD')
      .optional(),
    isOnline: Joi.boolean()
      .optional(),
    onlineLink: Joi.string()
      .uri()
      .optional(),
    registrationDeadline: Joi.date()
      .optional(),
  }),

  // Update event status validation
  updateEventStatus: Joi.object({
    status: Joi.string()
      .valid('active', 'cancelled', 'completed')
      .required()
      .messages({
        'any.only': 'Status must be one of: active, cancelled, completed',
        'any.required': 'Status is required',
      }),
  }),

  // Join event validation
  joinEvent: Joi.object({
    emergencyContact: Joi.object({
      name: Joi.string()
        .max(100)
        .optional()
        .messages({
          'string.max': 'Emergency contact name cannot exceed 100 characters',
        }),
      phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number',
        }),
      relationship: Joi.string()
        .max(50)
        .optional()
        .messages({
          'string.max': 'Relationship cannot exceed 50 characters',
        }),
    }).optional(),
    dietaryRequirements: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Dietary requirements cannot exceed 500 characters',
      }),
    accessibilityNeeds: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Accessibility needs cannot exceed 500 characters',
      }),
    notes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters',
      }),
  }),

  // Approve participant validation
  approveParticipant: Joi.object({
    notes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters',
      }),
  }),

  // Reject participant validation
  rejectParticipant: Joi.object({
    rejectionReason: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Rejection reason cannot exceed 500 characters',
        'any.required': 'Rejection reason is required',
      }),
    notes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters',
      }),
  }),

  // Bulk approve participants validation
  bulkApproveParticipants: Joi.object({
    participantIds: Joi.array()
      .items(Joi.string().required())
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one participant ID is required',
        'any.required': 'Participant IDs array is required',
      }),
  }),

  // Update participant validation
  updateParticipant: Joi.object({
    emergencyContact: Joi.object({
      name: Joi.string()
        .max(100)
        .optional(),
      phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional(),
      relationship: Joi.string()
        .max(50)
        .optional(),
    }).optional(),
    dietaryRequirements: Joi.string()
      .max(500)
      .optional(),
    accessibilityNeeds: Joi.string()
      .max(500)
      .optional(),
    notes: Joi.string()
      .max(1000)
      .optional(),
    checkedIn: Joi.boolean()
      .optional(),
  }),
};

module.exports = {
  validate,
  schemas,
};

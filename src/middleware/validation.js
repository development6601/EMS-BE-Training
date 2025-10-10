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
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    address: Joi.object({
      street: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      zipCode: Joi.string().max(10).optional(),
    }).optional(),
  }),
};

module.exports = {
  validate,
  schemas,
};

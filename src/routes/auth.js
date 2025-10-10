const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const config = require('../config');

const router = express.Router();

// Rate limiting for auth routes (using environment configuration)
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // From environment: RATE_LIMIT_WINDOW_MS
  max: config.rateLimit.maxRequests, // From environment: RATE_LIMIT_MAX_REQUESTS
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, validate(schemas.register), AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, validate(schemas.login), AuthController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', validate(schemas.refreshToken), AuthController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, AuthController.logout);


// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;

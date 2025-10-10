const AuthService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class AuthController {
  // @desc    Register new user
  // @route   POST /api/auth/register
  // @access  Public
  static register = asyncHandler(async (req, res) => {
    try {
      const result = await AuthService.register(req.body);
      
      logger.info(`New user registered: ${result.user.email}`);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  static login = asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      logger.info(`User logged in: ${result.user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      logger.error(`Login error for ${req.body.email}: ${error.message}`);
      throw error;
    }
  });

  // @desc    Refresh access token
  // @route   POST /api/auth/refresh
  // @access  Public
  static refreshToken = asyncHandler(async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Logout user
  // @route   POST /api/auth/logout
  // @access  Private
  static logout = asyncHandler(async (req, res) => {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      
      logger.info(`User logged out: ${req.user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error(`Logout error: ${error.message}`);
      throw error;
    }
  });


  // @desc    Get current user profile
  // @route   GET /api/auth/me
  // @access  Private
  static getMe = asyncHandler(async (req, res) => {
    try {
      const user = await AuthService.getUserProfile(req.user.userId);
      
      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      throw error;
    }
  });
}

module.exports = AuthController;

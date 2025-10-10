const UserService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class UserController {
  // @desc    Get all users (Admin only)
  // @route   GET /api/users
  // @access  Private (Admin)
  static getAllUsers = asyncHandler(async (req, res) => {
    try {
      const { page = 1, limit = 10, search, role, isBlocked } = req.query;
      
      const result = await UserService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        isBlocked: isBlocked ? isBlocked === 'true' : undefined
      });

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Get all users error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get user by ID (Admin only)
  // @route   GET /api/users/:id
  // @access  Private (Admin)
  static getUserById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user },
      });
    } catch (error) {
      logger.error(`Get user by ID error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Update user (Admin only)
  // @route   PUT /api/users/:id
  // @access  Private (Admin)
  static updateUser = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      const user = await UserService.updateUser(id, userData);

      logger.info(`User updated by admin: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user },
      });
    } catch (error) {
      logger.error(`Update user error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Delete user (Admin only)
  // @route   DELETE /api/users/:id
  // @access  Private (Admin)
  static deleteUser = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      
      await UserService.deleteUser(id);

      logger.info(`User deleted by admin: ${id}`);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error(`Delete user error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Block/Unblock user (Admin only)
  // @route   PUT /api/users/:id/block
  // @access  Private (Admin)
  static toggleUserBlock = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;
      
      const user = await UserService.toggleUserBlock(id, isBlocked);

      logger.info(`User ${isBlocked ? 'blocked' : 'unblocked'} by admin: ${user.email}`);

      res.status(200).json({
        success: true,
        message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: { user },
      });
    } catch (error) {
      logger.error(`Toggle user block error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get user profile
  // @route   GET /api/users/profile
  // @access  Private
  static getProfile = asyncHandler(async (req, res) => {
    try {
      const user = await UserService.getUserById(req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Update user profile
  // @route   PUT /api/users/profile
  // @access  Private
  static updateProfile = asyncHandler(async (req, res) => {
    try {
      const userData = req.body;
      const userId = req.user.userId;
      
      const user = await UserService.updateProfile(userId, userData);

      logger.info(`Profile updated: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get user statistics (Admin only)
  // @route   GET /api/users/stats
  // @access  Private (Admin)
  static getUserStats = asyncHandler(async (req, res) => {
    try {
      const stats = await UserService.getUserStats();

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error(`Get user stats error: ${error.message}`);
      throw error;
    }
  });
}

module.exports = UserController;

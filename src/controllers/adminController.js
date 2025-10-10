const AdminService = require('../services/adminService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class AdminController {
  // @desc    Get complete dashboard data
  // @route   GET /api/admin/dashboard
  // @access  Private (Admin)
  static getDashboard = asyncHandler(async (req, res) => {
    try {
      const dashboardData = await AdminService.getCompleteDashboard();

      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboardData,
      });
    } catch (error) {
      logger.error(`Get dashboard error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get user statistics
  // @route   GET /api/admin/dashboard/users/stats
  // @access  Private (Admin)
  static getUserStats = asyncHandler(async (req, res) => {
    try {
      const userStats = await AdminService.getUserStats();

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: userStats,
      });
    } catch (error) {
      logger.error(`Get user stats error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get event statistics
  // @route   GET /api/admin/dashboard/events/stats
  // @access  Private (Admin)
  static getEventStats = asyncHandler(async (req, res) => {
    try {
      const eventStats = await AdminService.getEventStats();

      res.status(200).json({
        success: true,
        message: 'Event statistics retrieved successfully',
        data: eventStats,
      });
    } catch (error) {
      logger.error(`Get event stats error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get participant statistics
  // @route   GET /api/admin/dashboard/participants/stats
  // @access  Private (Admin)
  static getParticipantStats = asyncHandler(async (req, res) => {
    try {
      const participantStats = await AdminService.getParticipantStats();

      res.status(200).json({
        success: true,
        message: 'Participant statistics retrieved successfully',
        data: participantStats,
      });
    } catch (error) {
      logger.error(`Get participant stats error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get users distribution chart data
  // @route   GET /api/admin/dashboard/charts/users-distribution
  // @access  Private (Admin)
  static getUsersDistributionChart = asyncHandler(async (req, res) => {
    try {
      const chartData = await AdminService.getUsersDistributionChart();

      res.status(200).json({
        success: true,
        message: 'Users distribution chart data retrieved successfully',
        data: chartData,
      });
    } catch (error) {
      logger.error(`Get users distribution chart error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get monthly users and events chart data
  // @route   GET /api/admin/dashboard/charts/monthly-users-events
  // @access  Private (Admin)
  static getMonthlyUsersEventsChart = asyncHandler(async (req, res) => {
    try {
      const chartData = await AdminService.getMonthlyUsersEventsChart();

      res.status(200).json({
        success: true,
        message: 'Monthly users and events chart data retrieved successfully',
        data: chartData,
      });
    } catch (error) {
      logger.error(`Get monthly users events chart error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get monthly participants chart data
  // @route   GET /api/admin/dashboard/charts/monthly-participants
  // @access  Private (Admin)
  static getMonthlyParticipantsChart = asyncHandler(async (req, res) => {
    try {
      const chartData = await AdminService.getMonthlyParticipantsChart();

      res.status(200).json({
        success: true,
        message: 'Monthly participants chart data retrieved successfully',
        data: chartData,
      });
    } catch (error) {
      logger.error(`Get monthly participants chart error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get recent activities
  // @route   GET /api/admin/dashboard/recent-activities
  // @access  Private (Admin)
  static getRecentActivities = asyncHandler(async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const activities = await AdminService.getRecentActivities(parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: { activities },
      });
    } catch (error) {
      logger.error(`Get recent activities error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get upcoming events
  // @route   GET /api/admin/dashboard/events/upcoming
  // @access  Private (Admin)
  static getUpcomingEvents = asyncHandler(async (req, res) => {
    try {
      const { limit = 10, days = 7 } = req.query;
      const events = await AdminService.getUpcomingEvents(parseInt(limit), parseInt(days));

      res.status(200).json({
        success: true,
        message: 'Upcoming events retrieved successfully',
        data: { events },
      });
    } catch (error) {
      logger.error(`Get upcoming events error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get most popular events
  // @route   GET /api/admin/dashboard/events/popular
  // @access  Private (Admin)
  static getMostPopularEvents = asyncHandler(async (req, res) => {
    try {
      const { limit = 5 } = req.query;
      const events = await AdminService.getMostPopularEvents(parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Most popular events retrieved successfully',
        data: { events },
      });
    } catch (error) {
      logger.error(`Get most popular events error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get pending approvals
  // @route   GET /api/admin/dashboard/participants/pending
  // @access  Private (Admin)
  static getPendingApprovals = asyncHandler(async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const participants = await AdminService.getPendingApprovals(parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Pending approvals retrieved successfully',
        data: { participants },
      });
    } catch (error) {
      logger.error(`Get pending approvals error: ${error.message}`);
      throw error;
    }
  });
}

module.exports = AdminController;

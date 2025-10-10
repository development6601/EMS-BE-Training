const ParticipantService = require('../services/participantService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class ParticipantController {
  // @desc    Join event
  // @route   POST /api/participants/join/:eventId
  // @access  Private (User)
  static joinEvent = asyncHandler(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.userId;
      const participantData = req.body;

      const participant = await ParticipantService.joinEvent(eventId, userId, participantData);

      logger.info(`User ${req.user.email} joined event ${eventId}`);

      res.status(201).json({
        success: true,
        message: 'Successfully applied for the event',
        data: { participant },
      });
    } catch (error) {
      logger.error(`Join event error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Leave event
  // @route   DELETE /api/participants/leave/:eventId
  // @access  Private (User)
  static leaveEvent = asyncHandler(async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.userId;

      const result = await ParticipantService.leaveEvent(eventId, userId);

      logger.info(`User ${req.user.email} left event ${eventId}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error(`Leave event error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get user's events with status
  // @route   GET /api/participants/my-events
  // @access  Private (User)
  static getMyEvents = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.userId;
      const { page, limit, status } = req.query;

      const result = await ParticipantService.getUserEvents(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
      });

      res.status(200).json({
        success: true,
        message: 'My events retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Get my events error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get event participants (Admin only)
  // @route   GET /api/participants/event/:eventId
  // @access  Private (Admin)
  static getEventParticipants = asyncHandler(async (req, res) => {
    try {
      const { eventId } = req.params;
      const { page, limit, status, search } = req.query;

      const result = await ParticipantService.getEventParticipants(eventId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
        search,
      });

      res.status(200).json({
        success: true,
        message: 'Event participants retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Get event participants error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Approve participant (Admin only)
  // @route   PUT /api/participants/:id/approve
  // @access  Private (Admin)
  static approveParticipant = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.userId;
      const { notes } = req.body;

      const participant = await ParticipantService.approveParticipant(id, adminId, notes);

      logger.info(`Participant ${id} approved by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Participant approved successfully',
        data: { participant },
      });
    } catch (error) {
      logger.error(`Approve participant error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Reject participant (Admin only)
  // @route   PUT /api/participants/:id/reject
  // @access  Private (Admin)
  static rejectParticipant = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.userId;
      const { rejectionReason, notes } = req.body;

      const participant = await ParticipantService.rejectParticipant(id, adminId, rejectionReason, notes);

      logger.info(`Participant ${id} rejected by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Participant rejected successfully',
        data: { participant },
      });
    } catch (error) {
      logger.error(`Reject participant error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Bulk approve participants (Admin only)
  // @route   PUT /api/participants/bulk-approve
  // @access  Private (Admin)
  static bulkApproveParticipants = asyncHandler(async (req, res) => {
    try {
      const { participantIds } = req.body;
      const adminId = req.user.userId;

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Participant IDs array is required',
        });
      }

      const result = await ParticipantService.bulkApproveParticipants(participantIds, adminId);

      logger.info(`${result.approvedCount} participants bulk approved by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { approvedCount: result.approvedCount },
      });
    } catch (error) {
      logger.error(`Bulk approve participants error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get participant statistics (Admin only)
  // @route   GET /api/participants/stats
  // @access  Private (Admin)
  static getParticipantStats = asyncHandler(async (req, res) => {
    try {
      const stats = await ParticipantService.getParticipantStats();

      res.status(200).json({
        success: true,
        message: 'Participant statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error(`Get participant stats error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get participant by ID (Admin only)
  // @route   GET /api/participants/:id
  // @access  Private (Admin)
  static getParticipantById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const participant = await ParticipantService.getParticipantById(id);

      res.status(200).json({
        success: true,
        message: 'Participant retrieved successfully',
        data: { participant },
      });
    } catch (error) {
      logger.error(`Get participant by ID error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Update participant (Admin only)
  // @route   PUT /api/participants/:id
  // @access  Private (Admin)
  static updateParticipant = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const participant = await ParticipantService.updateParticipant(id, updateData);

      logger.info(`Participant ${id} updated by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Participant updated successfully',
        data: { participant },
      });
    } catch (error) {
      logger.error(`Update participant error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Delete participant (Admin only)
  // @route   DELETE /api/participants/:id
  // @access  Private (Admin)
  static deleteParticipant = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await ParticipantService.deleteParticipant(id);

      logger.info(`Participant ${id} deleted by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      logger.error(`Delete participant error: ${error.message}`);
      throw error;
    }
  });
}

module.exports = ParticipantController;


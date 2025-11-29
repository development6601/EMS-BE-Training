const EventService = require('../services/eventService');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

class EventController {
  // @desc    Get all events
  // @route   GET /api/events
  // @access  Public
  static getAllEvents = asyncHandler(async (req, res) => {
    try {
      const { 
        page, 
        limit, 
        search, 
        category, 
        status, 
        isUpcoming,
        sortBy,
        sortOrder 
      } = req.query;
      
      // Get userId if user is logged in
      const userId = req.user?.userId || null;
      
      const result = await EventService.getAllEvents({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        category,
        status,
        isUpcoming,
        sortBy,
        sortOrder,
        userId,
      });

      res.status(200).json({
        success: true,
        message: 'Events retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error(`Get all events error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get event by ID
  // @route   GET /api/events/:id
  // @access  Public
  static getEventById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);

      res.status(200).json({
        success: true,
        message: 'Event retrieved successfully',
        data: { event },
      });
    } catch (error) {
      logger.error(`Get event by ID error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Create new event
  // @route   POST /api/events
  // @access  Private (Admin)
  static createEvent = asyncHandler(async (req, res) => {
    try {
      const eventData = req.body;
      const imageFile = req.file;
      
      // Set creator to current user
      eventData.createdBy = req.user.userId;
      
      const event = await EventService.createEvent(eventData, imageFile);

      logger.info(`New event created: ${event.title} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: { event },
      });
    } catch (error) {
      logger.error(`Create event error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Update event
  // @route   PUT /api/events/:id
  // @access  Private (Admin)
  static updateEvent = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const eventData = req.body;
      const imageFile = req.file;
      
      const event = await EventService.updateEvent(id, eventData, imageFile);

      logger.info(`Event updated: ${event.title} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: { event },
      });
    } catch (error) {
      logger.error(`Update event error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Delete event
  // @route   DELETE /api/events/:id
  // @access  Private (Admin)
  static deleteEvent = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      
      await EventService.deleteEvent(id);

      logger.info(`Event deleted: ${id} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      logger.error(`Delete event error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Update event status
  // @route   PUT /api/events/:id/status
  // @access  Private (Admin)
  static updateEventStatus = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const event = await EventService.updateEventStatus(id, status);

      logger.info(`Event status updated: ${event.title} to ${status} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Event status updated successfully',
        data: { event },
      });
    } catch (error) {
      logger.error(`Update event status error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get event statistics
  // @route   GET /api/events/stats
  // @access  Private (Admin)
  static getEventStats = asyncHandler(async (req, res) => {
    try {
      const stats = await EventService.getEventStats();

      res.status(200).json({
        success: true,
        message: 'Event statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      logger.error(`Get event stats error: ${error.message}`);
      throw error;
    }
  });

  // @desc    Get events by category
  // @route   GET /api/events/category/:category
  // @access  Public
  static getEventsByCategory = asyncHandler(async (req, res) => {
    try {
      const { category } = req.params;
      const { page, limit } = req.query;
      
      const result = await EventService.getEventsByCategory(category, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });

      res.status(200).json({
        success: true,
        message: `Events in ${category} category retrieved successfully`,
        data: result,
      });
    } catch (error) {
      logger.error(`Get events by category error: ${error.message}`);
      throw error;
    }
  });
}

module.exports = EventController;

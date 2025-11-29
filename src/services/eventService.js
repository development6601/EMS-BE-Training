const Event = require('../models/Event');
const EventParticipant = require('../models/EventParticipant');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

class EventService {
  // Get all events with pagination and filtering
  static async getAllEvents({ 
    page = 1, 
    limit = 10, 
    search, 
    category, 
    status, 
    isUpcoming,
    sortBy = 'eventDate',
    sortOrder = 'asc',
    userId = null
  }) {
    try {
      const query = {};

      // Build search query
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      // Add category filter
      if (category) {
        query.category = category;
      }

      // Add status filter
      if (status) {
        query.status = status;
      }

      // Add upcoming events filter
      if (isUpcoming === 'true') {
        query.eventDate = { $gt: new Date() };
        query.status = 'active';
      }

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [events, total] = await Promise.all([
        Event.find(query)
          .populate('createdBy', 'firstName lastName email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit),
        Event.countDocuments(query),
      ]);

      // Get participation status for each event if user is logged in
      let participationMap = {};
      if (userId && events.length > 0) {
        const eventIds = events.map(event => event._id);
        const participants = await EventParticipant.find({
          eventId: { $in: eventIds },
          userId: userId,
        }).select('eventId status');

        // Create a map of eventId -> participation status
        participants.forEach(participant => {
          participationMap[participant.eventId.toString()] = participant.status;
        });
      }

      // Add participation status to each event
      // Convert to plain object to ensure participationStatus is included in JSON
      const eventsWithParticipation = events.map(event => {
        const eventObj = event.toObject();
        const eventIdStr = event._id.toString();
        // Set participationStatus to the user's status if logged in, otherwise null
        eventObj.participationStatus = userId ? (participationMap[eventIdStr] || null) : null;
        return eventObj;
      });

      return {
        events: eventsWithParticipation,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get event by ID
  static async getEventById(eventId) {
    try {
      const event = await Event.findById(eventId)
        .populate('createdBy', 'firstName lastName email');
      
      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      throw error;
    }
  }

  // Create new event
  static async createEvent(eventData, imageFile = null) {
    try {
      let imageUrl = null;
      let imagePublicId = null;

      // Upload image if provided
      if (imageFile) {
        const uploadResult = await uploadToCloudinary(imageFile);
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      }

      const event = new Event({
        ...eventData,
        image: imageUrl,
        imagePublicId: imagePublicId,
      });

      await event.save();
      await event.populate('createdBy', 'firstName lastName email');

      return event;
    } catch (error) {
      // If event creation fails and image was uploaded, delete the image
      if (imageFile && imagePublicId) {
        await deleteFromCloudinary(imagePublicId);
      }
      throw error;
    }
  }

  // Update event
  static async updateEvent(eventId, eventData, imageFile = null) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }

      let imageUrl = event.image;
      let imagePublicId = event.imagePublicId;

      // Handle image update
      if (imageFile) {
        // Delete old image if exists
        if (event.imagePublicId) {
          await deleteFromCloudinary(event.imagePublicId);
        }

        // Upload new image
        const uploadResult = await uploadToCloudinary(imageFile);
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        {
          ...eventData,
          image: imageUrl,
          imagePublicId: imagePublicId,
        },
        { new: true, runValidators: true }
      ).populate('createdBy', 'firstName lastName email');

      return updatedEvent;
    } catch (error) {
      throw error;
    }
  }

  // Delete event
  static async deleteEvent(eventId) {
    try {
      const event = await Event.findById(eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }

      // Delete image from Cloudinary if exists
      if (event.imagePublicId) {
        await deleteFromCloudinary(event.imagePublicId);
      }

      await Event.findByIdAndDelete(eventId);
    } catch (error) {
      throw error;
    }
  }

  // Update event status
  static async updateEventStatus(eventId, status) {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { status },
        { new: true, runValidators: true }
      ).populate('createdBy', 'firstName lastName email');

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      throw error;
    }
  }

  // Get event statistics
  static async getEventStats() {
    try {
      const [
        totalEvents,
        activeEvents,
        completedEvents,
        cancelledEvents,
        upcomingEvents,
        recentEvents,
      ] = await Promise.all([
        Event.countDocuments(),
        Event.countDocuments({ status: 'active' }),
        Event.countDocuments({ status: 'completed' }),
        Event.countDocuments({ status: 'cancelled' }),
        Event.countDocuments({ 
          eventDate: { $gt: new Date() }, 
          status: 'active' 
        }),
        Event.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
      ]);

      return {
        totalEvents,
        activeEvents,
        completedEvents,
        cancelledEvents,
        upcomingEvents,
        recentEvents,
        eventGrowth: {
          last30Days: recentEvents,
          percentage: totalEvents > 0 ? ((recentEvents / totalEvents) * 100).toFixed(2) : 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get events by category
  static async getEventsByCategory(category, { page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      const [events, total] = await Promise.all([
        Event.find({ category, status: 'active' })
          .populate('createdBy', 'firstName lastName email')
          .sort({ eventDate: 1 })
          .skip(skip)
          .limit(limit),
        Event.countDocuments({ category, status: 'active' }),
      ]);

      return {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EventService;

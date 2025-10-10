const EventParticipant = require('../models/EventParticipant');
const Event = require('../models/Event');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class ParticipantService {
  // Join event
  static async joinEvent(eventId, userId, participantData = {}) {
    try {
      // Check if user can join the event
      await EventParticipant.canUserJoinEvent(eventId, userId);

      // Check if event exists and is active
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      if (event.status !== 'active') {
        throw new Error('Event is not active for participation');
      }

      // Check if event is full
      if (event.isFull) {
        throw new Error('Event is full');
      }

      // Check if registration deadline has passed
      if (event.isRegistrationClosed) {
        throw new Error('Registration deadline has passed');
      }

      // Create participant application
      const participant = new EventParticipant({
        eventId,
        userId,
        ...participantData,
      });

      await participant.save();
      await participant.populate([
        { path: 'eventId', select: 'title eventDate location' },
        { path: 'userId', select: 'firstName lastName email' },
      ]);

      return participant;
    } catch (error) {
      throw error;
    }
  }

  // Leave event
  static async leaveEvent(eventId, userId) {
    try {
      const participant = await EventParticipant.findOne({ eventId, userId });
      
      if (!participant) {
        throw new Error('You are not registered for this event');
      }

      if (participant.status === 'approved') {
        throw new Error('You cannot leave an approved event. Please contact the organizer.');
      }

      await EventParticipant.findByIdAndDelete(participant._id);
      
      return { message: 'Successfully left the event' };
    } catch (error) {
      throw error;
    }
  }

  // Get user's events with status
  static async getUserEvents(userId, { page = 1, limit = 10, status }) {
    try {
      const query = { userId };
      
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [participants, total] = await Promise.all([
        EventParticipant.find(query)
          .populate('eventId', 'title description eventDate eventTime location category status image')
          .populate('userId', 'firstName lastName email')
          .sort({ appliedAt: -1 })
          .skip(skip)
          .limit(limit),
        EventParticipant.countDocuments(query),
      ]);

      return {
        participants,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalParticipants: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get event participants (Admin only)
  static async getEventParticipants(eventId, { page = 1, limit = 10, status, search }) {
    try {
      const query = { eventId };
      
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      let participantsQuery = EventParticipant.find(query)
        .populate('userId', 'firstName lastName email phone')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit);

      // Add search functionality
      if (search) {
        participantsQuery = participantsQuery.populate({
          path: 'userId',
          match: {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          },
        });
      }

      const [participants, total] = await Promise.all([
        participantsQuery,
        EventParticipant.countDocuments(query),
      ]);

      // Filter out null users if search was applied
      const filteredParticipants = search 
        ? participants.filter(p => p.userId !== null)
        : participants;

      return {
        participants: filteredParticipants,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalParticipants: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Approve participant (Admin only)
  static async approveParticipant(participantId, adminId, notes = '') {
    try {
      const participant = await EventParticipant.findById(participantId)
        .populate('eventId')
        .populate('userId');

      if (!participant) {
        throw new Error('Participant not found');
      }

      if (participant.status !== 'pending') {
        throw new Error('Participant is not in pending status');
      }

      // Check if event is full
      if (participant.eventId.isFull) {
        throw new Error('Event is full. Cannot approve more participants.');
      }

      // Update participant status
      participant.status = 'approved';
      participant.reviewedBy = adminId;
      participant.reviewedAt = new Date();
      if (notes) {
        participant.notes = notes;
      }

      await participant.save();

      // Update event participant count
      await Event.findByIdAndUpdate(
        participant.eventId._id,
        { $inc: { currentParticipants: 1 } }
      );

      // Create approval notification
      try {
        await NotificationService.createParticipantApprovalNotification(participantId);
      } catch (notificationError) {
        // Log notification error but don't fail the approval
        console.error('Failed to create approval notification:', notificationError.message);
      }

      return participant;
    } catch (error) {
      throw error;
    }
  }

  // Reject participant (Admin only)
  static async rejectParticipant(participantId, adminId, rejectionReason = '', notes = '') {
    try {
      const participant = await EventParticipant.findById(participantId)
        .populate('eventId')
        .populate('userId');

      if (!participant) {
        throw new Error('Participant not found');
      }

      if (participant.status !== 'pending') {
        throw new Error('Participant is not in pending status');
      }

      // Update participant status
      participant.status = 'rejected';
      participant.reviewedBy = adminId;
      participant.reviewedAt = new Date();
      participant.rejectionReason = rejectionReason;
      if (notes) {
        participant.notes = notes;
      }

      await participant.save();

      // Create rejection notification
      try {
        await NotificationService.createParticipantRejectionNotification(participantId, rejectionReason);
      } catch (notificationError) {
        // Log notification error but don't fail the rejection
        console.error('Failed to create rejection notification:', notificationError.message);
      }

      return participant;
    } catch (error) {
      throw error;
    }
  }

  // Bulk approve participants (Admin only)
  static async bulkApproveParticipants(participantIds, adminId) {
    try {
      const participants = await EventParticipant.find({
        _id: { $in: participantIds },
        status: 'pending',
      }).populate('eventId');

      if (participants.length === 0) {
        throw new Error('No pending participants found');
      }

      // Check if any event is full
      const fullEvents = participants.filter(p => p.eventId.isFull);
      if (fullEvents.length > 0) {
        throw new Error('Some events are full and cannot accept more participants');
      }

      // Update participants
      const updateResult = await EventParticipant.updateMany(
        { _id: { $in: participantIds }, status: 'pending' },
        {
          status: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        }
      );

      // Update event participant counts
      const eventUpdates = {};
      participants.forEach(participant => {
        const eventId = participant.eventId._id.toString();
        eventUpdates[eventId] = (eventUpdates[eventId] || 0) + 1;
      });

      for (const [eventId, count] of Object.entries(eventUpdates)) {
        await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: count } });
      }

      // Create approval notifications for all approved participants
      try {
        const approvedParticipants = await EventParticipant.find({
          _id: { $in: participantIds },
          status: 'approved',
        });

        for (const participant of approvedParticipants) {
          try {
            await NotificationService.createParticipantApprovalNotification(participant._id);
          } catch (notificationError) {
            console.error(`Failed to create approval notification for participant ${participant._id}:`, notificationError.message);
          }
        }
      } catch (notificationError) {
        console.error('Failed to create bulk approval notifications:', notificationError.message);
      }

      return {
        approvedCount: updateResult.modifiedCount,
        message: `${updateResult.modifiedCount} participants approved successfully`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get participant statistics
  static async getParticipantStats() {
    try {
      const [
        totalParticipants,
        pendingParticipants,
        approvedParticipants,
        rejectedParticipants,
        recentParticipants,
      ] = await Promise.all([
        EventParticipant.countDocuments(),
        EventParticipant.countDocuments({ status: 'pending' }),
        EventParticipant.countDocuments({ status: 'approved' }),
        EventParticipant.countDocuments({ status: 'rejected' }),
        EventParticipant.countDocuments({
          appliedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      return {
        totalParticipants,
        pendingParticipants,
        approvedParticipants,
        rejectedParticipants,
        recentParticipants,
        approvalRate: totalParticipants > 0 ? ((approvedParticipants / totalParticipants) * 100).toFixed(2) : '0.00',
      };
    } catch (error) {
      throw error;
    }
  }

  // Get participant by ID
  static async getParticipantById(participantId) {
    try {
      const participant = await EventParticipant.findById(participantId)
        .populate('eventId', 'title eventDate location status')
        .populate('userId', 'firstName lastName email phone')
        .populate('reviewedBy', 'firstName lastName email');

      if (!participant) {
        throw new Error('Participant not found');
      }

      return participant;
    } catch (error) {
      throw error;
    }
  }

  // Update participant (Admin only)
  static async updateParticipant(participantId, updateData) {
    try {
      const participant = await EventParticipant.findByIdAndUpdate(
        participantId,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName email');

      if (!participant) {
        throw new Error('Participant not found');
      }

      return participant;
    } catch (error) {
      throw error;
    }
  }

  // Delete participant (Admin only)
  static async deleteParticipant(participantId) {
    try {
      const participant = await EventParticipant.findById(participantId);

      if (!participant) {
        throw new Error('Participant not found');
      }

      // If participant was approved, decrease event participant count
      if (participant.status === 'approved') {
        await Event.findByIdAndUpdate(
          participant.eventId,
          { $inc: { currentParticipants: -1 } }
        );
      }

      await EventParticipant.findByIdAndDelete(participantId);
      
      return { message: 'Participant removed successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get all pending participants with advanced filtering
  static async getAllPendingParticipants({
    page = 1,
    limit = 20,
    search,
    eventId,
    sortBy = 'appliedAt',
    sortOrder = 'desc',
  }) {
    try {
      const query = { status: 'pending' };

      // Add event filter if provided
      if (eventId) {
        query.eventId = eventId;
      }

      const skip = (page - 1) * limit;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      let participantsQuery = EventParticipant.find(query)
        .populate('userId', 'firstName lastName email phone')
        .populate('eventId', 'title eventDate eventTime location category')
        .populate('reviewedBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('appliedAt userId eventId notes emergencyContact dietaryRequirements accessibilityNeeds');

      // Add search functionality
      if (search) {
        participantsQuery = participantsQuery.populate({
          path: 'userId',
          match: {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          },
        });
      }

      const [participants, total] = await Promise.all([
        participantsQuery,
        EventParticipant.countDocuments(query),
      ]);

      // Filter out null users if search was applied
      const filteredParticipants = search 
        ? participants.filter(p => p.userId !== null)
        : participants;

      return {
        participants: filteredParticipants,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalParticipants: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        filters: {
          search,
          eventId,
          sortBy,
          sortOrder,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ParticipantService;


const User = require('../models/User');
const Event = require('../models/Event');
const EventParticipant = require('../models/EventParticipant');

class AdminService {
  // Get complete dashboard data
  static async getCompleteDashboard() {
    try {
      const [
        userStats,
        eventStats,
        participantStats,
        usersDistributionChart,
        monthlyUsersEventsChart,
        monthlyParticipantsChart,
        recentActivities,
        upcomingEvents,
        mostPopularEvents,
        pendingApprovals,
      ] = await Promise.all([
        this.getUserStats(),
        this.getEventStats(),
        this.getParticipantStats(),
        this.getUsersDistributionChart(),
        this.getMonthlyUsersEventsChart(),
        this.getMonthlyParticipantsChart(),
        this.getRecentActivities(10),
        this.getUpcomingEvents(10, 7),
        this.getMostPopularEvents(5),
        this.getPendingApprovals(10),
      ]);

      return {
        summaryCards: {
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          blockedUsers: userStats.blockedUsers,
          totalEvents: eventStats.totalEvents,
          activeEvents: eventStats.activeEvents,
          totalParticipants: participantStats.totalParticipants,
          newUsersLast30Days: userStats.newUsersLast30Days,
          upcomingEventsNext7Days: eventStats.upcomingEventsNext7Days,
          usersPendingApproval: participantStats.pendingParticipants,
          mostPopularEvent: mostPopularEvents[0] || null,
        },
        charts: {
          usersDistribution: usersDistributionChart,
          monthlyUsersEvents: monthlyUsersEventsChart,
          monthlyParticipants: monthlyParticipantsChart,
        },
        recentData: {
          activities: recentActivities,
          upcomingEvents,
          mostPopularEvents,
          pendingApprovals,
        },
        growthMetrics: {
          userGrowthPercentage: userStats.userGrowthPercentage,
          eventGrowthPercentage: eventStats.eventGrowthPercentage,
          participantGrowthPercentage: participantStats.participantGrowthPercentage,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersLast30Days,
        newUsersLast7Days,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isBlocked: false }),
        User.countDocuments({ isBlocked: true }),
        User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      ]);

      // Calculate growth percentage
      const previousPeriodUsers = totalUsers - newUsersLast30Days;
      const userGrowthPercentage = previousPeriodUsers > 0 
        ? ((newUsersLast30Days / previousPeriodUsers) * 100).toFixed(2)
        : '0.00';

      return {
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersLast30Days,
        newUsersLast7Days,
        userGrowthPercentage,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get event statistics
  static async getEventStats() {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalEvents,
        activeEvents,
        upcomingEventsNext7Days,
        recentEventsCount,
      ] = await Promise.all([
        Event.countDocuments(),
        Event.countDocuments({ status: 'active' }),
        Event.countDocuments({ 
          eventDate: { $gte: now, $lte: sevenDaysFromNow },
          status: 'active'
        }),
        Event.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      ]);

      // Calculate growth percentage
      const previousPeriodEvents = totalEvents - recentEventsCount;
      const eventGrowthPercentage = previousPeriodEvents > 0 
        ? ((recentEventsCount / previousPeriodEvents) * 100).toFixed(2)
        : '0.00';

      return {
        totalEvents,
        activeEvents,
        upcomingEventsNext7Days,
        recentEventsCount,
        eventGrowthPercentage,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get participant statistics
  static async getParticipantStats() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalParticipants,
        pendingParticipants,
        approvedParticipants,
        rejectedParticipants,
        recentParticipantsCount,
      ] = await Promise.all([
        EventParticipant.countDocuments(),
        EventParticipant.countDocuments({ status: 'pending' }),
        EventParticipant.countDocuments({ status: 'approved' }),
        EventParticipant.countDocuments({ status: 'rejected' }),
        EventParticipant.countDocuments({ appliedAt: { $gte: thirtyDaysAgo } }),
      ]);

      // Calculate growth percentage
      const previousPeriodParticipants = totalParticipants - recentParticipantsCount;
      const participantGrowthPercentage = previousPeriodParticipants > 0 
        ? ((recentParticipantsCount / previousPeriodParticipants) * 100).toFixed(2)
        : '0.00';

      return {
        totalParticipants,
        pendingParticipants,
        approvedParticipants,
        rejectedParticipants,
        recentParticipantsCount,
        participantGrowthPercentage,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get users distribution chart data (Pie Chart)
  static async getUsersDistributionChart() {
    try {
      const [activeUsers, blockedUsers] = await Promise.all([
        User.countDocuments({ isBlocked: false }),
        User.countDocuments({ isBlocked: true }),
      ]);

      return {
        labels: ['Active Users', 'Blocked Users'],
        data: [activeUsers, blockedUsers],
        colors: ['#52c41a', '#ff4d4f'],
        total: activeUsers + blockedUsers,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get monthly users and events chart data (Bar Chart 1)
  static async getMonthlyUsersEventsChart() {
    try {
      const currentYear = new Date().getFullYear();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const monthlyData = [];

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);

        const [newUsers, newEvents] = await Promise.all([
          User.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
          }),
          Event.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
          }),
        ]);

        monthlyData.push({
          month: months[month],
          newUsers,
          newEvents,
        });
      }

      return {
        labels: months,
        datasets: [
          {
            label: 'New Users',
            data: monthlyData.map(item => item.newUsers),
            backgroundColor: '#1890ff',
          },
          {
            label: 'New Events',
            data: monthlyData.map(item => item.newEvents),
            backgroundColor: '#52c41a',
          },
        ],
      };
    } catch (error) {
      throw error;
    }
  }

  // Get monthly participants chart data (Bar Chart 2)
  static async getMonthlyParticipantsChart() {
    try {
      const currentYear = new Date().getFullYear();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const monthlyData = [];

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(currentYear, month, 1);
        const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);

        const participants = await EventParticipant.countDocuments({
          appliedAt: { $gte: startDate, $lte: endDate }
        });

        monthlyData.push({
          month: months[month],
          participants,
        });
      }

      return {
        labels: months,
        datasets: [
          {
            label: 'Event Participants',
            data: monthlyData.map(item => item.participants),
            backgroundColor: '#722ed1',
          },
        ],
      };
    } catch (error) {
      throw error;
    }
  }

  // Get recent activities
  static async getRecentActivities(limit = 10) {
    try {
      const activities = [];

      // Get recent user registrations
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('firstName lastName email createdAt');

      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registration',
          message: `${user.firstName} ${user.lastName} registered`,
          timestamp: user.createdAt,
          user: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
        });
      });

      // Get recent event creations
      const recentEvents = await Event.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .select('title createdAt createdBy');

      recentEvents.forEach(event => {
        activities.push({
          type: 'event_created',
          message: `Event "${event.title}" was created`,
          timestamp: event.createdAt,
          event: {
            title: event.title,
            createdBy: event.createdBy,
          },
        });
      });

      // Get recent participant applications
      const recentParticipants = await EventParticipant.find()
        .sort({ appliedAt: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .populate('eventId', 'title')
        .select('status appliedAt userId eventId');

      recentParticipants.forEach(participant => {
        activities.push({
          type: 'participant_applied',
          message: `${participant.userId.firstName} ${participant.userId.lastName} applied for "${participant.eventId.title}"`,
          timestamp: participant.appliedAt,
          participant: {
            user: participant.userId,
            event: participant.eventId,
            status: participant.status,
          },
        });
      });

      // Sort all activities by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming events
  static async getUpcomingEvents(limit = 10, days = 7) {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const events = await Event.find({
        eventDate: { $gte: now, $lte: futureDate },
        status: 'active',
      })
        .populate('createdBy', 'firstName lastName email')
        .sort({ eventDate: 1 })
        .limit(limit)
        .select('title eventDate eventTime location maxParticipants currentParticipants category');

      return events;
    } catch (error) {
      throw error;
    }
  }

  // Get most popular events by participant count
  static async getMostPopularEvents(limit = 5) {
    try {
      const events = await Event.find({ status: 'active' })
        .populate('createdBy', 'firstName lastName email')
        .sort({ currentParticipants: -1 })
        .limit(limit)
        .select('title eventDate location currentParticipants maxParticipants category');

      return events;
    } catch (error) {
      throw error;
    }
  }

  // Get pending approvals
  static async getPendingApprovals(limit = 10) {
    try {
      const participants = await EventParticipant.find({ status: 'pending' })
        .populate('userId', 'firstName lastName email')
        .populate('eventId', 'title eventDate')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ appliedAt: -1 })
        .limit(limit)
        .select('appliedAt userId eventId notes');

      return participants;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AdminService;

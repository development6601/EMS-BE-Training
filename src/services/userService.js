const User = require('../models/User');

class UserService {
  // Get all users with pagination and filtering
  static async getAllUsers({ page = 1, limit = 10, search, role, isBlocked }) {
    try {
      const query = {};

      // Build search query
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Add role filter
      if (role) {
        query.role = role;
      }

      // Add blocked status filter
      if (isBlocked !== undefined) {
        query.isBlocked = isBlocked;
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query),
      ]);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update user (Admin only)
  static async updateUser(userId, userData) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password, email, role, ...allowedFields } = userData;

      const user = await User.findByIdAndUpdate(
        userId,
        allowedFields,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Delete user (Admin only)
  static async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      await User.findByIdAndDelete(userId);
    } catch (error) {
      throw error;
    }
  }

  // Toggle user block status (Admin only)
  static async toggleUserBlock(userId, isBlocked) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isBlocked },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, profileData) {
    try {
      // Remove fields that shouldn't be updated via profile
      const { password, email, role, isBlocked, ...allowedFields } = profileData;

      const user = await User.findByIdAndUpdate(
        userId,
        allowedFields,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics (Admin only)
  static async getUserStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        blockedUsers,
        adminUsers,
        recentUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isBlocked: false }),
        User.countDocuments({ isBlocked: true }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
      ]);

      return {
        totalUsers,
        activeUsers,
        blockedUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        recentUsers,
        userGrowth: {
          last30Days: recentUsers,
          percentage: totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(2) : 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;

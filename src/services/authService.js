const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { generateTokens, verifyAccessToken, verifyRefreshToken } = require('../config/jwt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

class AuthService {
  // Register new user
  static async register(userData) {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        dateOfBirth,
        gender,
        phone, 
        bio,
        website,
        socialMedia,
        address,
        preferences
      } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user with all provided fields
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        bio,
        website,
        socialMedia,
        address,
        preferences,
      });

      await user.save();

      // Generate tokens
      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      const { accessToken, refreshToken } = generateTokens(payload);

      // Save refresh token to database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await RefreshToken.createToken(user._id, refreshToken, expiresAt);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is blocked
      if (user.isBlocked) {
        throw new Error('Account is blocked. Please contact administrator');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update login tracking
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();

      // Generate tokens
      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      const { accessToken, refreshToken } = generateTokens(payload);

      // Save refresh token to database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await RefreshToken.createToken(user._id, refreshToken, expiresAt);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const tokenDoc = await RefreshToken.verifyToken(refreshToken);

      // Get user details
      const user = await User.findById(tokenDoc.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isBlocked) {
        throw new Error('Account is blocked');
      }

      // Generate new tokens
      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);

      // Update refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await RefreshToken.createToken(user._id, newRefreshToken, expiresAt);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  static async logout(refreshToken) {
    try {
      if (refreshToken) {
        await RefreshToken.revokeToken(refreshToken);
      }
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }


  // Verify access token
  static async verifyAccessToken(token) {
    try {
      const decoded = verifyAccessToken(token);
      
      // Check if user still exists and is not blocked
      const user = await User.findById(decoded.userId);
      if (!user || user.isBlocked) {
        throw new Error('Invalid token or user blocked');
      }

      return {
        userId: user._id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    token: {
      type: String,
      required: [true, 'Refresh token is required'],
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Token expiration is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

// TTL index to automatically delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create refresh token
refreshTokenSchema.statics.createToken = async function (userId, token, expiresAt) {
  try {
    // Remove any existing refresh tokens for this user
    await this.deleteMany({ userId });
    
    // Create new refresh token
    const refreshToken = new this({
      userId,
      token,
      expiresAt,
    });

    return await refreshToken.save();
  } catch (error) {
    throw error;
  }
};

// Static method to verify refresh token
refreshTokenSchema.statics.verifyToken = async function (token) {
  try {
    const refreshToken = await this.findOne({ token });
    
    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.deleteOne({ _id: refreshToken._id });
      throw new Error('Refresh token has expired');
    }

    return refreshToken;
  } catch (error) {
    throw error;
  }
};

// Static method to revoke refresh token
refreshTokenSchema.statics.revokeToken = async function (token) {
  try {
    return await this.deleteOne({ token });
  } catch (error) {
    throw error;
  }
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllUserTokens = async function (userId) {
  try {
    return await this.deleteMany({ userId });
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);

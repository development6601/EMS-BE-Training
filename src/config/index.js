require('dotenv').config();

console.log('🔧 Loading configuration...');
console.log('📁 Environment file loaded:', process.env.NODE_ENV || 'development');
console.log('🔌 MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management');
console.log('🌐 Port:', process.env.PORT || 5000);

const config = {
  // Server Configuration
  port: process.env.PORT || 3500,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management',
  },

  // JWT Configuration
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your_super_secret_access_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key',
    accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

module.exports = config;

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const config = require('./config');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const participantRoutes = require('./routes/participants');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

class App {
  constructor() {
    console.log('📦 Creating Express application...');
    this.app = express();
    console.log('✅ Express app created');
    
    console.log('🔧 Setting up middleware...');
    this.setupMiddleware();
    console.log('✅ Middleware setup complete');
    
    console.log('🛣️ Setting up routes...');
    this.setupRoutes();
    console.log('✅ Routes setup complete');
    
    console.log('⚠️ Setting up error handling...');
    this.setupErrorHandling();
    console.log('✅ Error handling setup complete');
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later',
      },
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // Load Swagger documentation
    console.log('📚 Loading Swagger documentation...');
    const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger/swagger.yaml'));
    console.log('✅ Swagger documentation loaded');

    // Swagger UI setup
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Event Management API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
    }));

    // Health check route
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

        // API routes
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/users', userRoutes);
        this.app.use('/api/events', eventRoutes);
        this.app.use('/api/participants', participantRoutes);
        this.app.use('/api/admin', adminRoutes);
        this.app.use('/api/notifications', notificationRoutes);

    // API documentation route
    this.app.get('/api', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Event Management API',
        version: '1.0.0',
        documentation: {
          swagger: '/api-docs',
          health: '/health',
        },
            endpoints: {
              auth: '/api/auth',
              users: '/api/users',
              events: '/api/events',
              participants: '/api/participants',
              admin: '/api/admin',
              notifications: '/api/notifications',
              health: '/health',
            },
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFound);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      console.log('🚀 Starting Event Management Backend Server...');
      
      // Connect to database
      console.log('🔌 Connecting to database...');
      await connectDB();
      console.log('✅ Database connection established');
      
      // Start server
      const PORT = config.port;
      console.log(`🌐 Starting server on port ${PORT}...`);
      
      this.app.listen(PORT, () => {
        logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
        console.log(`📋 API Info: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      console.log('\n❌ Server startup failed!');
      console.log('Error:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if MongoDB is running');
      console.log('2. Verify .env file configuration');
      console.log('3. Ensure port 5000 is available');
      console.log('4. Run: npm run seed (if database is empty)\n');
      process.exit(1);
    }
  }
}

module.exports = App;

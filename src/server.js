const App = require('./app');

console.log('🚀 Initializing Event Management Backend...');
console.log('📁 Current working directory:', process.cwd());
console.log('🔧 Node version:', process.version);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Create and start the application
console.log('📦 Creating App instance...');
const app = new App();
console.log('✅ App instance created');

console.log('🚀 Starting app...');
app.start().catch((error) => {
  console.error('❌ Failed to start application:', error);
  console.error('❌ Error stack:', error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

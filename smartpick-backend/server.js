const app = require('./src/app');
const connectDB = require('./src/config/database');
const environment = require('./src/config/environment');

// Connect to MongoDB
connectDB();

const server = app.listen(environment.PORT, () => {
  console.log(`
🚀 SmartPick Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Mode: ${environment.NODE_ENV}
🔗 URL: http://localhost:${environment.PORT}
💾 Database: ${environment.MONGODB_URI}
📚 Status: Running
━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated!');
  });
});
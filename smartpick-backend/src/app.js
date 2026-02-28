const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const environment = require('./config/environment');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const limiter = require('./middleware/rateLimiter');

// Initialize express
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: environment.isProduction,
  crossOriginEmbedderPolicy: environment.isProduction
}));

// CORS configuration
app.use(cors({
  origin: environment.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (environment.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting (apply to all routes)
app.use('/api', limiter);

// API Routes
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/quiz', require('./routes/quiz.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: environment.NODE_ENV
  });
});

// API Routes (to be added later)
// app.use('/api/books', require('./routes/book.routes'));
// app.use('/api/ai', require('./routes/ai.routes'));
// app.use('/api/quiz', require('./routes/quiz.routes'));

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
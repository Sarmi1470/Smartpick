const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const environment = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpick',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/smartpick_test',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Rate Limiting
  RATE_LIMIT: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  },
  
  // AI Service
  AI_SERVICE: {
    endpoint: process.env.AI_SERVICE_ENDPOINT || 'http://localhost:3001',
    apiKey: process.env.AI_API_KEY
  },
  
  // Validation
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test'
};

// Validate required environment variables in production
if (environment.isProduction) {
  const required = ['MONGODB_URI', 'AI_API_KEY'];
  for (const variable of required) {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }
}

module.exports = environment;
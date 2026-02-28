const rateLimit = require('express-rate-limit');
const environment = require('../config/environment');

const limiter = rateLimit({
  windowMs: environment.RATE_LIMIT.window,
  max: environment.RATE_LIMIT.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = limiter;
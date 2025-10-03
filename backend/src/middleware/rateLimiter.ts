import rateLimit from 'express-rate-limit';

// Rate limiting configuration
export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message || 'Too many requests, please try again later',
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
export const generalRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later'
);

export const apiRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  200, // 200 requests per window
  'API rate limit exceeded, please try again later'
);

export const searchRateLimit = createRateLimiter(
  1 * 60 * 1000, // 1 minute
  30, // 30 requests per window
  'Search rate limit exceeded, please try again later'
);

export const seedRateLimit = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  5, // 5 requests per window
  'Seed rate limit exceeded, please try again later'
);


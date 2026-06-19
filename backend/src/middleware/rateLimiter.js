import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

export const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(windowMs / 1000 / 60),
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

// Stricter limiter for user registration / lookup to prevent abuse
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many accounts created. Please try again in an hour.',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

// Stricter limiter for logging carbon assessments to prevent spamming
export const assessmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many carbon footprint assessments logged. Please try again in an hour.',
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

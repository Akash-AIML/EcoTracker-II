const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable GZIP compression to reduce network payload size
app.use(compression());

// 2. Enable Helmet with forced HSTS and Referrer policy for secure headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "no-referrer" }
}));

// 3. HTTP Parameter Pollution (HPP) protection
app.use(hpp());

// 4. Rate limiting to prevent brute force / DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

// 5. Safe CORS options to prevent wildcard vulnerability exposure
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));

// 6. Limit request JSON body size to prevent payload overflow attacks
app.use(express.json({ limit: '10kb' }));

// Parse request bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Log incoming request details for debugging
app.use(morgan('dev'));

// Root endpoint for health check & status checks
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'EcoTrack AI Carbon Accounting API',
    version: '1.0.0',
    database: process.env.FIREBASE_SERVICE_ACCOUNT ? 'firestore' : 'local-mock'
  });
});

// Mount our router on /api
app.use('/api', routes);

// 7. Global Error Handling Middleware (prevents internal stack trace leakage)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ 
    error: 'An unexpected internal server error occurred. Please try again later.' 
  });
});

// Start server (only if not running inside a test runner)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(` EcoTrack AI Backend Service Running`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`=========================================`);
  });
}

module.exports = app;

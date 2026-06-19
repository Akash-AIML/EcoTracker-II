const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Helmet for secure HTTP headers (prevents XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting to prevent brute force / DoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiter to all API routes
app.use('/api', limiter);

// Enable CORS so the React Native Web client can fetch from it
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

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

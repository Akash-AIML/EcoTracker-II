const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` EcoTrack AI Backend Service Running`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});

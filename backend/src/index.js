import 'dotenv/config';
import app from './app.js';
import logger from './utils/logger.js';
import db from './utils/firebaseClient.js';

const PORT = parseInt(process.env.PORT) || 3001;

async function main() {
  // Test database connection
  try {
    // Check if Firestore connection works by retrieving a single document reference
    await db.collection('users').limit(1).get();
    logger.info('✅ Firebase Firestore connected successfully');
  } catch (err) {
    logger.error('❌ Firebase Firestore connection failed', { error: err.message });
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info(`🚀 EcoGuide AI API running on http://localhost:${PORT}`, {
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();

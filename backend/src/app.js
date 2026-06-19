import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import userRoutes from './routes/users.js';
import assessmentRoutes from './routes/assessments.js';
import recommendationRoutes from './routes/recommendations.js';
import simulationRoutes from './routes/simulations.js';
import aiRoutes from './routes/ai.js';

const app = express();

// Trust Railway/Vercel reverse proxy for accurate IP and HTTPS
app.set('trust proxy', 1);

// ── Security Headers (Helmet) ─────────────────────────────────────────────────
// BACKEND_PUBLIC_URL: the public URL of this API server.
// Keeping it in an env var means the CSP isn't hard-coded to one Railway deployment.
// Falls back to the original Railway URL so existing deployments keep working.
const backendPublicUrl =
  process.env.BACKEND_PUBLIC_URL || 'https://carbon-production-49fd.up.railway.app';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // NOTE: 'unsafe-inline' is required for styleSrc to allow:
        // 1. Vite's dynamic style injection in development.
        // 2. Tailwind's utility class injection at runtime.
        // 3. Google Fonts dynamic CSS stylesheet generation.
        styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", backendPublicUrl, '*.vercel.app', 'http://localhost:*'],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    // xssFilter removed — deprecated in Helmet 7 and no longer effective in modern browsers.
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // permittedCrossDomainPolicies removed — was a no-op (false is not a valid option).
    frameguard: { action: 'deny' },
  })
);

// ── Permissions-Policy Header ───────────────────────────────────────────────
// Restrict access to sensitive browser APIs that this application does not use.
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// ── CORS ─────────────────────────────────────────────────────────────────────
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const corsOrigins = corsOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      const isAllowed =
        corsOrigins.some((allowed) => origin === allowed) || origin.endsWith('.vercel.app');
      callback(null, isAllowed);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/ai', aiRoutes);

// ── 404 & Error Handling ──────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

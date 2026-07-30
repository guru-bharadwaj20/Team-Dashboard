import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import proposalRoutes from './routes/proposals.js';
import publicRoutes from './routes/public.js';
import notificationRoutes from './routes/notifications.js';
import contactRoutes from './routes/contact.js';
import analyticsRoutes from './routes/analytics.js';
import activityRoutes from './routes/activity.js';
import exportRoutes from './routes/export.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import { socketAuth } from './middleware/socketAuth.js';
import { sanitizeRequest } from './middleware/sanitize.js';
import { startDeadlineSweeper } from './services/deadlineService.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CLIENT_URL accepts a comma-separated list, so preview and staging deployments
// can be allowed alongside production. A single string still works unchanged.
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const PORT = process.env.PORT || 5000;

/** Shared by Express CORS and the Socket.io handshake. */
const corsOrigin = (origin, callback) => {
  // Same-origin and non-browser callers (curl, health checks) send no Origin.
  if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error(`Origin not allowed by CORS: ${origin}`));
};

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'], credentials: true },
  pingInterval: 25000,
  pingTimeout: 60000,
  transports: ['websocket', 'polling'],
});

// Every socket connection must present a valid JWT before any event is handled.
io.use(socketAuth);

app.set('io', io);

// ── Database ──────────────────────────────────────────────────────────────────
connectDB()
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => {
    logger.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ── Security Middleware ───────────────────────────────────────────────────────
// Render/Railway/Vercel put the app behind a reverse proxy. Without this, every
// request presents the proxy's IP and the rate limiters key the entire user base
// into a single bucket (and express-rate-limit v7 refuses to trust X-Forwarded-For).
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // This process serves JSON and PDF only — never HTML that loads scripts — so
    // the policy can be maximally restrictive. Helmet's default CSP still allows
    // 'self' scripts and styles, which this API has no use for.
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
  })
);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' })); // Prevent large payload DoS
app.use(cookieParser());
app.use(sanitizeRequest); // Strip Mongo operators from all user input
app.use(apiLimiter); // Global rate limiting

// ── Health ────────────────────────────────────────────────────────────────────
// Reports the database state rather than a bare ok:true, which stayed green
// while Mongo was down and made the check useless to a load balancer.
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const dbUp = state === 1;
  res.status(dbUp ? 200 : 503).json({
    ok: dbUp,
    db: DB_STATES[state] ?? 'unknown',
    uptime: Math.round(process.uptime()),
    ts: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/export', exportRoutes);

// ── Not Found ─────────────────────────────────────────────────────────────────
// Unmatched /api routes previously fell through to Express's default HTML error
// page, which a JSON client cannot parse.
app.use('/api', notFoundHandler);

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Socket.io Connection Handling ────────────────────────────────────────────
io.on('connection', (socket) => {
  // The personal notification room is derived from the verified JWT, never from a
  // client-supplied id — otherwise any client could subscribe to another user's feed.
  socket.join(`user:${socket.user.id}`);

  socket.on('join-team', (teamId) => {
    if (teamId) socket.join(`team:${teamId}`);
  });
  socket.on('leave-team', (teamId) => {
    if (teamId) socket.leave(`team:${teamId}`);
  });

  socket.on('join-proposal', (proposalId) => {
    if (proposalId) socket.join(`proposal:${proposalId}`);
  });
  socket.on('leave-proposal', (proposalId) => {
    if (proposalId) socket.leave(`proposal:${proposalId}`);
  });

  socket.on('error', (err) => logger.error('[Socket]', err.message));
});

// ── Background jobs ───────────────────────────────────────────────────────────
const stopDeadlineSweeper = startDeadlineSweeper(io);

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// ── Shutdown ──────────────────────────────────────────────────────────────────
// SIGTERM previously killed the process outright, dropping in-flight requests and
// leaving Mongo connections and open sockets to time out on the other side.
let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received — shutting down`);

  // Stop accepting work, then drain.
  stopDeadlineSweeper();

  const forceExit = setTimeout(() => {
    logger.error('Shutdown timed out after 10s — forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    await io.close();
    await new Promise((resolve, reject) =>
      httpServer.close((err) => (err ? reject(err) : resolve()))
    );
    await mongoose.connection.close(false);
    logger.info('Shutdown complete');
    clearTimeout(forceExit);
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// A rejected promise or a thrown error outside a request previously died
// silently (or killed the process with no log line at all).
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason instanceof Error ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err.stack || err.message);
  // The process is in an undefined state after this; drain and exit.
  shutdown('uncaughtException');
});

export { app, httpServer, io };

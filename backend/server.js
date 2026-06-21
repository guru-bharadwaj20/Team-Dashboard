import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
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

import { errorHandler } from './middleware/errorHandler.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 5000;

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
  pingInterval: 25000,
  pingTimeout: 60000,
  transports: ['websocket', 'polling'],
});

app.set('io', io);

// ── Database ──────────────────────────────────────────────────────────────────
connectDB()
  .then(() => console.log('✓ MongoDB connected'))
  .catch((err) => { console.error('✗ MongoDB failed:', err.message); process.exit(1); });

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' })); // Prevent large payload DoS
app.use(apiLimiter); // Global rate limiting

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

app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Socket.io Connection Handling ────────────────────────────────────────────
io.on('connection', (socket) => {
  // Join team room
  socket.on('join-team', (teamId) => {
    if (teamId) socket.join(`team:${teamId}`);
  });
  socket.on('leave-team', (teamId) => {
    if (teamId) socket.leave(`team:${teamId}`);
  });

  // Join proposal room
  socket.on('join-proposal', (proposalId) => {
    if (proposalId) socket.join(`proposal:${proposalId}`);
  });
  socket.on('leave-proposal', (proposalId) => {
    if (proposalId) socket.leave(`proposal:${proposalId}`);
  });

  // Join personal notification room (targeted delivery)
  socket.on('join-user', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {});
  socket.on('error', (err) => console.error('[Socket]', err.message));
});

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));

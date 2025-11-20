import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import proposalRoutes from './routes/proposals.js';
import publicRoutes from './routes/public.js';
import notificationRoutes from './routes/notifications.js';
import contactRoutes from './routes/contact.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

const PORT = process.env.PORT || 5000;

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('✓ MongoDB connected');
  })
  .catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✓ Client connected:', socket.id);

  // Join team room
  socket.on('join-team', (teamId) => {
    try {
      socket.join(`team:${teamId}`);
      console.log(`Socket ${socket.id} joined team:${teamId}`);
    } catch (error) {
      console.error(`Error joining team ${teamId}:`, error);
    }
  });

  // Leave team room
  socket.on('leave-team', (teamId) => {
    try {
      socket.leave(`team:${teamId}`);
      console.log(`Socket ${socket.id} left team:${teamId}`);
    } catch (error) {
      console.error(`Error leaving team ${teamId}:`, error);
    }
  });

  // Join proposal room
  socket.on('join-proposal', (proposalId) => {
    try {
      socket.join(`proposal:${proposalId}`);
      console.log(`Socket ${socket.id} joined proposal:${proposalId}`);
    } catch (error) {
      console.error(`Error joining proposal ${proposalId}:`, error);
    }
  });

  // Leave proposal room
  socket.on('leave-proposal', (proposalId) => {
    try {
      socket.leave(`proposal:${proposalId}`);
      console.log(`Socket ${socket.id} left proposal:${proposalId}`);
    } catch (error) {
      console.error(`Error leaving proposal ${proposalId}:`, error);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('✗ Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', socket.id, error);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

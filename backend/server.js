import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/teams.js';
import proposalRoutes from './routes/proposals.js';
import publicRoutes from './routes/public.js';
import userRoutes from './routes/user.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        process.env.CLIENT_URL,
      ];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user', userRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket Server with JWT authentication
const wsServer = http.createServer();
const io = new SocketIOServer(wsServer, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        process.env.CLIENT_URL,
      ];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
});

// WebSocket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected via WebSocket`);

  // Join user to their personal room
  socket.join(`user:${socket.userId}`);

  // Listen for team room joins
  socket.on('join-team', (teamId) => {
    socket.join(`team:${teamId}`);
    io.to(`team:${teamId}`).emit('user-joined', {
      userId: socket.userId,
      teamId: teamId,
      message: 'A user joined the team',
    });
  });

  // Listen for proposal updates
  socket.on('proposal-updated', (data) => {
    io.to(`team:${data.teamId}`).emit('proposal-changed', data);
  });

  // Listen for vote updates
  socket.on('vote-cast', (data) => {
    io.to(`proposal:${data.proposalId}`).emit('vote-received', data);
  });

  // Listen for new comments
  socket.on('comment-added', (data) => {
    io.to(`proposal:${data.proposalId}`).emit('new-comment', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

wsServer.listen(WEBSOCKET_PORT, () => {
  console.log(`WebSocket server running on port ${WEBSOCKET_PORT}`);
});

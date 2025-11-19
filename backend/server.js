import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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

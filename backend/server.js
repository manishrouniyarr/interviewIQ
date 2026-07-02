import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './Routes/auth.js';
import interviewRoutes from './Routes/interview.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://interview-iq-taupe.vercel.app',
    'https://interview-iq-iiq.vercel.app',
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'InterviewIQ API',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
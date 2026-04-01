import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './Routes/auth.js';
import interviewRoutes from './Routes/interview.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://interview-iq-taupe.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'InterviewIQ API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protected)'
      },
      interview: {
        generateQuestions: 'POST /api/interview/generate-questions',
        getFeedback: 'POST /api/interview/get-feedback'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    groqApiKey: !!process.env.GROQ_API_KEY,
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ InterviewIQ Backend running`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? 'Loaded ✅' : 'Missing ❌'}`);
  console.log(`💾 MongoDB: ${process.env.MONGODB_URI ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`${'='.repeat(50)}\n`);
});
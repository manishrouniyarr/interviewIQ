import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Junior', 'Mid-Level', 'Senior']
  },
  questions: [{
    id: Number,
    question: String,
    topic: String,
    difficulty: String,
    answer: String,
    feedback: String,
    score: Number
  }],
  overallScore: {
    type: Number,
    default: 0
  },
  duration: String,
  summary: {
  type: String,
  default: ''
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
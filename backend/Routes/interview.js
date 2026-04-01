import express from 'express';
import Groq from 'groq-sdk';
import Interview from '../models/Interview.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// Parse resume into structured profile
async function extractResumeProfile(resumeText, groq) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `Extract structured information from this resume. Return ONLY a JSON object, nothing else:

Resume:
${resumeText.slice(0, 4000)}

Return this exact format:
{
  "skills": ["skill1", "skill2"],
  "experience": ["Company X - Role - what they did", "Company Y - Role - what they did"],
  "projects": ["Project name - tech used - what it does"],
  "education": "Degree, Institution",
  "yearsOfExperience": 2
}`
    }],
    temperature: 0.1,
    max_tokens: 800,
  });

  try {
    const text = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return {};
  }
}

// Generate questions (protected)
router.post('/generate-questions', authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, resumeText } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Role and difficulty are required' });
    }

    console.log('🎯 Generating questions for:', role, difficulty);

    const groq = getGroqClient();

    let resumeProfile = null;
    if (resumeText && resumeText.trim().length > 100) {
      resumeProfile = await extractResumeProfile(resumeText, groq);
      console.log('📄 Resume profile extracted:', resumeProfile);
    }

    const resumeContext = resumeProfile ? `
Candidate Profile (extracted from resume):
- Skills: ${resumeProfile.skills?.join(', ') || 'Not specified'}
- Experience: ${resumeProfile.experience?.join(' | ') || 'Not specified'}
- Projects: ${resumeProfile.projects?.join(' | ') || 'Not specified'}
- Education: ${resumeProfile.education || 'Not specified'}
- Years of Experience: ${resumeProfile.yearsOfExperience || 'Not specified'}

IMPORTANT: Reference specific skills, projects, and experience from their resume in your questions.
For example: "I see you've worked with X at Company Y - explain how you handled..."
Or: "Your project Z uses [technology] - how would you improve its architecture?"
` : '';

    const prompt = `You are an expert technical interviewer. Generate 5 highly personalized interview questions for a ${difficulty} level ${role} position.

${resumeContext}

Requirements:
- If resume data is available, at least 3 questions must directly reference specific skills, projects, or experience from their resume
- Mix of technical depth questions, system design, and behavioral/situational
- Match ${difficulty} difficulty — ${difficulty === 'Junior' ? 'focus on fundamentals and learning ability' : difficulty === 'Mid-Level' ? 'focus on practical experience and problem solving' : 'focus on architecture, leadership, and advanced concepts'}
- Make questions feel like a real interview, not generic

Return ONLY a JSON array:
[
  {
    "id": 1,
    "question": "Question text here",
    "difficulty": "${difficulty}",
    "topic": "React" or "Node.js" or "System Design" or "Behavioral" etc
  }
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || '';
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Failed to parse questions');

    const questions = JSON.parse(jsonMatch[0]);
    console.log('✅ Generated', questions.length, 'personalized questions');
    res.json({ questions, resumeProfile });

  } catch (error) {
    console.error('❌ Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Get AI feedback (protected)
router.post('/get-feedback', authenticateToken, async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    console.log('💬 Getting feedback...');
    const groq = getGroqClient();

    const prompt = `You are an expert technical interviewer providing feedback on a candidate's answer.

Question: ${question}

Candidate's Answer: ${answer}

Evaluate the answer and provide:
1. What was good about the answer
2. What was missing or could be improved
3. Specific suggestions to make it better

Scoring guide (score out of 5):
- 5: Excellent, comprehensive answer with specific examples
- 4: Good answer, covers main points but missing some depth
- 3: Average, covers basics but lacks detail
- 2: Weak, missing key concepts
- 1: Very poor, off-topic, too short, or nonsensical

Keep feedback concise (3-4 sentences) and constructive.

End with exactly this on the last line: SCORE: X`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const feedback = completion.choices[0]?.message?.content || '';
const scoreMatch = feedback.match(/SCORE:\s*(\d+)/i);
const rawScore = scoreMatch ? parseInt(scoreMatch[1]) : 3;
const score = Math.min(rawScore, 5);

    console.log('✅ Feedback generated, score:', score);
    res.json({ feedback, score });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});

// Suggest role from resume text (protected)
router.post('/suggest-role', authenticateToken, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text required' });

    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Based on this resume, suggest the single most appropriate job role.
        
Resume:
${resumeText.slice(0, 3000)}

Reply with ONLY the job role title (e.g. "Frontend Developer", "Android Developer", "Cloud Engineer", "Data Engineer", "Backend Developer", etc.).
Do not limit yourself to a predefined list — infer the best role from their actual experience.
Reply with ONLY the role name, nothing else.`
      }],
      temperature: 0.2,
      max_tokens: 20,
    });

    const role = completion.choices[0]?.message?.content?.trim();
    console.log('✅ Suggested role:', role);
    res.json({ role });

  } catch (error) {
    console.error('❌ Role suggestion error:', error);
    res.status(500).json({ error: 'Failed to suggest role' });
  }
});

// Save interview (protected)
router.post('/save-interview', authenticateToken, async (req, res) => {
  try {
    const { role, difficulty, questions, overallScore, duration } = req.body;

    // Generate summary using Groq
    let summary = '';
    try {
      const groq = getGroqClient();
      const summaryPrompt = `You are an expert interviewer. Based on this interview performance, write a 2-3 sentence debrief summary.

Role: ${role}
Difficulty: ${difficulty}
Questions and scores:
${questions.map(q => `- ${q.topic}: Score ${q.score}/5 — Q: "${q.question.slice(0, 80)}..."`).join('\n')}
Overall Score: ${overallScore}/5

Write a concise, honest, encouraging summary covering:
1. What they did well (mention specific topics)
2. What needs improvement
3. One actionable tip

Keep it under 3 sentences. Be direct and helpful.`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: summaryPrompt }],
        temperature: 0.5,
        max_tokens: 200,
      });
      summary = completion.choices[0]?.message?.content?.trim() || '';
      console.log('✅ Summary generated');
    } catch (err) {
      console.error('⚠️ Summary generation failed (non-blocking):', err);
    }

    const interview = new Interview({
      userId: req.user.userId,
      role, difficulty, questions, overallScore, duration, summary
    });

    await interview.save();
    console.log('✅ Interview saved for user:', req.user.email);
    res.json({ message: 'Interview saved successfully', interview, summary });

  } catch (error) {
    console.error('❌ Error saving interview:', error);
    res.status(500).json({ error: 'Failed to save interview' });
  }
});
// Get user's interviews (protected)
router.get('/my-interviews', authenticateToken, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    console.log('✅ Fetched', interviews.length, 'interviews for user');
    res.json({ interviews });

  } catch (error) {
    console.error('❌ Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// Get user statistics (protected)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.userId });

    const totalInterviews = interviews.length;
    const avgScore = interviews.length > 0
      ? Math.round(interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length)
      : 0;

    const topicScores = {};
    interviews.forEach(interview => {
      interview.questions.forEach(q => {
        if (!topicScores[q.topic]) {
          topicScores[q.topic] = { total: 0, count: 0 };
        }
        if (q.score) {
          topicScores[q.topic].total += q.score;
          topicScores[q.topic].count += 1;
        }
      });
    });

    const topicData = Object.keys(topicScores).map(topic => ({
      skill: topic,
      score: Math.round((topicScores[topic].total / topicScores[topic].count) * 10)
    }));

    const bestTopic = topicData.length > 0
      ? topicData.reduce((max, topic) => topic.score > max.score ? topic : max, topicData[0])
      : { skill: 'React', score: 0 };

    res.json({
      totalInterviews,
      avgScore,
      bestTopic: bestTopic.skill,
      topicData,
      recentInterviews: interviews.slice(0, 10).map(i => ({
        id: i._id,
        role: i.role,
        date: i.createdAt,
        score: i.overallScore,
        duration: i.duration,
        questions: i.questions.length
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
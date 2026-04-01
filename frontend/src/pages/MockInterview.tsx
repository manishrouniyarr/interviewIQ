import { useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import { Upload, Sparkles, Loader2, Save, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from "react-hot-toast";

interface ResumeProfile {
  skills?: string[];
  experience?: string[];
  projects?: string[];
  education?: string;
  yearsOfExperience?: number;
}

export default function MockInterview() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [role, setRole] = useState('');
  const [suggestedRole, setSuggestedRole] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState('');
  const [showDebrief, setShowDebrief] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = (window as any).pdfjsLib;

    if (!pdfjsLib) {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    const pdfjs = (window as any).pdfjsLib;
    pdfjs.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const suggestRoleFromResume = async (text: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/interview/suggest-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resumeText: text }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.role) { setSuggestedRole(data.role); setRole(data.role); }
    } catch (err) {
      console.error('Role suggestion failed:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setIsParsing(true);
    setSuggestedRole('');
    setResumeProfile(null);
    try {
      let text = '';
      if (uploadedFile.type === 'application/pdf') {
        text = await extractTextFromPDF(uploadedFile);
      } else {
        text = await uploadedFile.text();
      }
      setResumeText(text);
      await suggestRoleFromResume(text);
    } catch (err) {
      console.error('Resume parsing failed:', err);
      toast.error('Could not parse resume. You can still enter your role manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${BASE_URL}/api/interview/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, difficulty, resumeText }),
      });
      if (!response.ok) throw new Error('Failed to generate questions');
      const data = await response.json();
      setQuestions(data.questions);
      if (data.resumeProfile) setResumeProfile(data.resumeProfile);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to generate questions. Make sure you're logged in.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getFeedback = async () => {
    if (!selectedQuestion || !currentAnswer.trim()) {
      toast.error('Please select a question and provide an answer');
      return;
    }
    setIsFeedbackLoading(true);
    setFeedback('');
    try {
      const response = await fetch(`${BASE_URL}/api/interview/get-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: selectedQuestion.question, answer: currentAnswer }),
      });
      if (!response.ok) throw new Error('Failed to get feedback');
      const data = await response.json();
      setFeedback(data.feedback);
      const updatedQuestion = {
        ...selectedQuestion,
        answer: currentAnswer,
        feedback: data.feedback,
        score: data.score || 7,
      };
      setAnsweredQuestions((prev) => [
        ...prev.filter((q) => q.id !== selectedQuestion.id),
        updatedQuestion,
      ]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get feedback.');
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const saveInterview = async () => {
  if (answeredQuestions.length === 0) {
    toast.error('Please answer at least one question before saving.');
    return;
  }
  setIsSaving(true);
  try {
    const overallScore = Math.round(
      answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length
    );
    const response = await fetch(`${BASE_URL}/api/interview/save-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role, difficulty, questions: answeredQuestions, overallScore, duration: '45 min' }),
    });
    if (!response.ok) throw new Error('Failed to save interview');
    const data = await response.json();

    // Show debrief instead of immediately resetting
    setInterviewSummary(data.summary || '');
    setShowDebrief(true);
    toast.success('Interview saved!');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to save interview.');
  } finally {
    setIsSaving(false);
  }
};

const resetInterview = () => {
  setQuestions([]); setAnsweredQuestions([]); setCurrentAnswer('');
  setFeedback(''); setSelectedQuestion(null); setRole('');
  setDifficulty(''); setFile(null); setResumeText('');
  setSuggestedRole(''); setResumeProfile(null);
  setInterviewSummary(''); setShowDebrief(false);
};

 

  return (
  <div className="p-6 md:p-8">
    <h1 className="text-2xl font-bold text-slate-100 mb-2">Mock Interview</h1>
    <p className="text-slate-400 mb-8">Upload your resume and start practicing.</p>

    {questions.length === 0 ? (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Setup Your Interview</h2>

          {/* Resume Upload */}
          <div className="mb-6">
            <label className="block text-slate-300 font-semibold mb-2">
              Upload Resume <span className="text-slate-500 font-normal">(Optional — auto-detects role & personalizes questions)</span>
            </label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
              file ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50'
            }`}>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" id="resume-upload" />
              <label htmlFor="resume-upload" className="cursor-pointer">
                {isParsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                    <p className="text-slate-300 font-medium">Parsing resume & detecting role...</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle className="w-10 h-10 text-indigo-400" />
                    <p className="text-indigo-400 font-semibold">{file.name}</p>
                    {suggestedRole && (
                      <span className="text-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded-full">
                        ✨ Detected role: {suggestedRole}
                      </span>
                    )}
                    <p className="text-slate-500 text-sm">Click to change</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300 mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500">PDF, DOC, DOCX (Max 5MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Role */}
          <div className="mb-6">
            <label className="block text-slate-300 font-semibold mb-2">
              Your Target Role
              {suggestedRole && (
                <span className="ml-2 text-indigo-400 text-sm font-normal">(auto-detected from resume)</span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer, Android Engineer, Cloud Architect..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none pr-10"
              />
              {role && (
                <button
                  onClick={() => { setRole(''); setSuggestedRole(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Type any role — not limited to a fixed list</p>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <label className="block text-slate-300 font-semibold mb-2">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-4">
              {['Junior', 'Mid-Level', 'Senior'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-3 rounded-lg font-semibold transition ${
                    difficulty === level
                      ? 'bg-indigo-600 text-white border border-indigo-500'
                      : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuestions}
            disabled={!role.trim() || !difficulty || isGenerating || isParsing}
            className="w-full bg-white text-slate-900 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" />InterviewIQ is Generating Questions...</>
            ) : (
              <><svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <rect width="28" height="28" rx="8" fill="#6366f1"/>
                <path d="M14 6L16.5 11.5H22L17.5 14.5L19.5 20L14 16.5L8.5 20L10.5 14.5L6 11.5H11.5L14 6Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
                <circle cx="20" cy="8" r="2" fill="#a5b4fc"/>
              </svg>Generate Questions</>
            )}
          </button>
        </div>
      </div>

    ) : showDebrief ? (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">

          {/* Overall Score Circle */}
          <div className="mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold border-4 ${
              (answeredQuestions.reduce((s, q) => s + q.score, 0) / answeredQuestions.length) >= 4
                ? 'border-green-500 text-green-400 bg-green-900/20'
                : (answeredQuestions.reduce((s, q) => s + q.score, 0) / answeredQuestions.length) >= 3
                ? 'border-yellow-500 text-yellow-400 bg-yellow-900/20'
                : 'border-red-500 text-red-400 bg-red-900/20'
            }`}>
              {(answeredQuestions.reduce((s, q) => s + q.score, 0) / answeredQuestions.length).toFixed(1)}
            </div>
            <p className="text-slate-400 text-sm">Overall Score out of 5</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">Interview Complete!</h2>
          <p className="text-slate-400 mb-6">{role} · {difficulty}</p>

          {/* Per-question scores */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[...answeredQuestions].sort((a, b) => a.id - b.id).map((q) => (
              <div key={q.id} className={`rounded-lg p-3 border ${
                q.score >= 4 ? 'bg-green-900/20 border-green-700/40' :
                q.score >= 3 ? 'bg-yellow-900/20 border-yellow-700/40' :
                'bg-red-900/20 border-red-700/40'
              }`}>
                <p className="text-xs text-slate-400 mb-1">Q{q.id}</p>
                <p className={`text-lg font-bold ${
                  q.score >= 4 ? 'text-green-400' :
                  q.score >= 3 ? 'text-yellow-400' : 'text-red-400'
                }`}>{q.score}/5</p>
                <p className="text-xs text-slate-500 truncate">{q.topic}</p>
              </div>
            ))}
          </div>

          {/* AI Debrief Summary */}
          {interviewSummary && (
            <div className="bg-indigo-900/30 border border-indigo-700/40 rounded-xl p-5 mb-6 text-left">
              <h3 className="text-sm font-semibold text-indigo-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                InterviewIQ Debrief
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{interviewSummary}</p>
            </div>
          )}

          <button
            onClick={resetInterview}
            className="w-full bg-white text-slate-900 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Start New Interview
          </button>
        </div>
      </div>

    ) : (
      <div className="max-w-4xl mx-auto">

        {/* Resume Profile Card */}
        {resumeProfile && resumeProfile.skills && resumeProfile.skills.length > 0 && (
          <div className="bg-slate-800 border border-indigo-500/30 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Resume Analysis — Questions personalized to your profile
            </h3>
            <div className="flex flex-wrap gap-2">
              {resumeProfile.skills.slice(0, 10).map((skill) => (
                <span key={skill} className="text-xs bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded-md">
                  {skill}
                </span>
              ))}
              {resumeProfile.skills.length > 10 && (
                <span className="text-xs text-slate-500">+{resumeProfile.skills.length - 10} more</span>
              )}
            </div>
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">InterviewIQ Questions</h2>
              <p className="text-slate-400 text-sm mt-1">{role} · {difficulty}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveInterview}
                disabled={answeredQuestions.length === 0 || isSaving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />Save Interview</>
                )}
              </button>
              <button
                onClick={resetInterview}
                className="text-slate-400 hover:text-slate-100 font-semibold transition"
              >
                Start New
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">
                Progress: <span className="text-slate-100 font-semibold">{answeredQuestions.length}/{questions.length}</span> answered
              </span>
              {answeredQuestions.length === questions.length && (
                <span className="text-sm text-green-400 font-semibold">✓ All done — save your interview!</span>
              )}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${(answeredQuestions.length / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              const answeredQ = answeredQuestions.find((aq) => aq.id === q.id);
              return (
                <div key={q.id} className="rounded-xl transition">
                  <div
                    onClick={() => {
                      setSelectedQuestion(isSelected ? null : q);
                      setCurrentAnswer('');
                      setFeedback('');
                    }}
                    className={`cursor-pointer rounded-xl transition ${
                      isSelected ? 'ring-2 ring-indigo-500' : ''
                    } ${answeredQ ? 'opacity-60' : ''}`}
                  >
                    <QuestionCard question={q} />
                  </div>

                  {answeredQ && !isSelected && (
                    <div className="mt-2 ml-4">
                      <span className="text-sm bg-green-900/30 text-green-400 border border-green-700/40 px-3 py-1 rounded-full font-medium">
                        ✓ Answered · Score: {answeredQ.score}/5 {answeredQ.score >= 4 ? '🟢' : answeredQ.score >= 3 ? '🟡' : '🔴'}
                      </span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="mt-3 bg-slate-700/50 border border-slate-600 rounded-xl p-5">
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-36 px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none outline-none"
                        autoFocus
                      />
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-slate-500">{currentAnswer.length} characters</p>
                        <button
                          onClick={getFeedback}
                          disabled={!currentAnswer.trim() || isFeedbackLoading}
                          className="bg-white text-slate-900 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          {isFeedbackLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Getting Feedback...</>
                          ) : (
                            <><svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                              <rect width="28" height="28" rx="8" fill="#6366f1"/>
                              <path d="M14 6L16.5 11.5H22L17.5 14.5L19.5 20L14 16.5L8.5 20L10.5 14.5L6 11.5H11.5L14 6Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
                              <circle cx="20" cy="8" r="2" fill="#a5b4fc"/>
                            </svg>Get Feedback</>
                          )}
                        </button>
                      </div>

                      {feedback && (
                        <div className="mt-4 p-4 bg-indigo-900/30 border border-indigo-700/40 rounded-xl">
                          <h4 className="font-bold text-indigo-300 mb-2 flex items-center gap-2 text-sm">
                            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                              <rect width="28" height="28" rx="8" fill="#6366f1"/>
                              <path d="M14 6L16.5 11.5H22L17.5 14.5L19.5 20L14 16.5L8.5 20L10.5 14.5L6 11.5H11.5L14 6Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
                              <circle cx="20" cy="8" r="2" fill="#a5b4fc"/>
                            </svg>InterviewIQ Feedback
                          </h4>
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{feedback}</p>
                          {answeredQ && (
                            <div className="mt-3 flex items-center gap-3">
                              <span className={`text-sm px-3 py-1 rounded-full font-semibold border ${
                                answeredQ.score >= 4
                                  ? 'bg-green-900/30 text-green-400 border-green-700/40'
                                  : answeredQ.score >= 3
                                  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40'
                                  : 'bg-red-900/30 text-red-400 border-red-700/40'
                              }`}>
                                ✓ Score: {answeredQ.score}/5
                              </span>
                              <span className="text-xs text-slate-400">
                                {answeredQ.score >= 4 ? 'Excellent answer' : answeredQ.score >= 3 ? 'Good, room to improve' : 'Needs more detail'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
  </div>
);
}
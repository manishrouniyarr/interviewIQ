import { useState, useRef } from 'react';
import QuestionCard from '../components/QuestionCard';
import { Upload, Loader2, Save, CheckCircle, X } from 'lucide-react';
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

  // Refs for each question for auto-scroll
  const questionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
    } catch (err) { console.error('Role suggestion failed:', err); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile); setIsParsing(true); setSuggestedRole(''); setResumeProfile(null);
    try {
      let text = '';
      if (uploadedFile.type === 'application/pdf') text = await extractTextFromPDF(uploadedFile);
      else text = await uploadedFile.text();
      setResumeText(text);
      await suggestRoleFromResume(text);
    } catch (err) {
      console.error('Resume parsing failed:', err);
      toast.error('Could not parse resume. You can still enter your role manually.');
    } finally { setIsParsing(false); }
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
    } finally { setIsGenerating(false); }
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

      // Auto-scroll to next unanswered question after 1.5s
      setTimeout(() => {
        const currentIndex = questions.findIndex((q) => q.id === selectedQuestion.id);
        const nextQuestion = questions.slice(currentIndex + 1).find(
          (q) => ![...answeredQuestions, updatedQuestion].some((aq) => aq.id === q.id)
        );
        if (nextQuestion && questionRefs.current[nextQuestion.id]) {
          questionRefs.current[nextQuestion.id]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          setSelectedQuestion(nextQuestion);
          setCurrentAnswer('');
          setFeedback('');
        }
      }, 1500);

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

  const avgScore = answeredQuestions.length
    ? answeredQuestions.reduce((s, q) => s + q.score, 0) / answeredQuestions.length
    : 0;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Mock Interview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Upload your resume and start practicing.</p>
      </div>

      {/* Setup screen */}
      {questions.length === 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Setup your interview</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Resume <span className="text-slate-400 font-normal">(optional — auto-detects role)</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                file
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/40'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {isParsing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Parsing resume & detecting role...</p>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle className="w-9 h-9 text-blue-500" />
                      <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{file.name}</p>
                      {suggestedRole && (
                        <span className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-3 py-1 rounded-full font-medium">
                          Detected: {suggestedRole}
                        </span>
                      )}
                      <p className="text-xs text-slate-400">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-400">PDF, DOC, DOCX (Max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target role
                {suggestedRole && <span className="ml-2 text-blue-500 text-xs font-normal">(auto-detected)</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer, Android Engineer..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10 transition"
                />
                {role && (
                  <button
                    onClick={() => { setRole(''); setSuggestedRole(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Type any role — not limited to a fixed list</p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Difficulty level</label>
              <div className="grid grid-cols-3 gap-3">
                {['Junior', 'Mid-Level', 'Senior'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition border ${
                      difficulty === level
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
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
              className="w-full bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-lg font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating
                ? <><Loader2 className="w-4 h-4 animate-spin" />Generating questions...</>
                : 'Generate questions'}
            </button>
          </div>
        </div>
      )}

      {/* Debrief screen */}
      {questions.length > 0 && showDebrief && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold border-4 ${
                avgScore >= 4 ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
                : avgScore >= 3 ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10'
                : 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
              }`}>
                {avgScore.toFixed(1)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Overall score out of 5</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Interview complete!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{role} · {difficulty}</p>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {[...answeredQuestions].sort((a, b) => a.id - b.id).map((q) => (
                <div key={q.id} className={`rounded-xl p-3 border ${
                  q.score >= 4 ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                  : q.score >= 3 ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'
                  : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                }`}>
                  <p className="text-xs text-slate-400 mb-1">Q{q.id}</p>
                  <p className={`text-lg font-bold ${
                    q.score >= 4 ? 'text-green-600 dark:text-green-400'
                    : q.score >= 3 ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>{q.score}/5</p>
                  <p className="text-xs text-slate-400 truncate">{q.topic}</p>
                </div>
              ))}
            </div>

            {interviewSummary && (
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-5 mb-6 text-left">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">InterviewIQ Debrief</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{interviewSummary}</p>
              </div>
            )}

            <button
              onClick={resetInterview}
              className="w-full bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-lg font-semibold text-sm transition"
            >
              Start new interview
            </button>
          </div>
        </div>
      )}

      {/* Interview screen */}
      {questions.length > 0 && !showDebrief && (
        <div className="max-w-4xl mx-auto">

          {resumeProfile?.skills && resumeProfile.skills.length > 0 && (
            <ResumeSkills skills={resumeProfile.skills} />
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interview questions</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{role} · {difficulty}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveInterview}
                  disabled={answeredQuestions.length === 0 || isSaving}
                  className="bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                    : <><Save className="w-4 h-4" />Save</>}
                </button>
                <button
                  onClick={resetInterview}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  Start new
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Progress: <span className="text-slate-900 dark:text-white font-semibold">{answeredQuestions.length}/{questions.length}</span> answered
                </span>
                {answeredQuestions.length === questions.length && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">All done — save your interview!</span>
                )}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(answeredQuestions.length / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                const answeredQ = answeredQuestions.find((aq) => aq.id === q.id);
                return (
                  <div
                    key={q.id}
                    ref={(el) => { questionRefs.current[q.id] = el; }}
                  >
                    <div
                      onClick={() => {
                        setSelectedQuestion(isSelected ? null : q);
                        setCurrentAnswer('');
                        setFeedback('');
                      }}
                      className={`cursor-pointer rounded-xl transition ${isSelected ? 'ring-2 ring-blue-500' : ''} ${answeredQ && !isSelected ? 'opacity-60' : ''}`}
                    >
                      <QuestionCard question={q} />
                    </div>

                    {answeredQ && !isSelected && (
                      <div className="mt-2 ml-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                          answeredQ.score >= 4 ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20'
                          : answeredQ.score >= 3 ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                        }`}>
                          Answered · Score: {answeredQ.score}/5
                        </span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                        <textarea
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full h-36 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none transition"
                          autoFocus
                        />
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs text-slate-400">{currentAnswer.length} characters</p>
                          <button
                            onClick={getFeedback}
                            disabled={!currentAnswer.trim() || isFeedbackLoading}
                            className="bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isFeedbackLoading
                              ? <><Loader2 className="w-4 h-4 animate-spin" />Getting feedback...</>
                              : 'Get feedback'}
                          </button>
                        </div>

                        {feedback && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 text-sm">
                              InterviewIQ Feedback
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{feedback}</p>
                            {answeredQ && (
                              <div className="mt-3 flex items-center gap-3">
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                                  answeredQ.score >= 4 ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20'
                                  : answeredQ.score >= 3 ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                }`}>
                                  Score: {answeredQ.score}/5
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

function ResumeSkills({ skills }: { skills: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? skills : skills.slice(0, 10);
  const remaining = skills.length - 10;

  return (
    <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5 mb-5">
      <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wide">
        Resume analysis — questions personalized to your profile
      </h3>
      <div className="flex flex-wrap gap-2">
        {visible.map((skill) => (
          <span key={skill} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md">
            {skill}
          </span>
        ))}
        {remaining > 0 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium px-2.5 py-1 border border-blue-200 dark:border-blue-500/20 rounded-md bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
          >
            {showAll ? '− Show less' : `+${remaining} more`}
          </button>
        )}
      </div>
    </div>
  );
}
interface QuestionCardProps {
  question: {
    id: number;
    question: string;
    difficulty: string;
    topic: string;
  };
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const difficultyColors = {
    Junior: 'bg-green-900/30 text-green-400 border border-green-700/40',
    'Mid-Level': 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/40',
    Senior: 'bg-red-900/30 text-red-400 border border-red-700/40',
    Easy: 'bg-green-900/30 text-green-400 border border-green-700/40',
    Medium: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/40',
    Hard: 'bg-red-900/30 text-red-400 border border-red-700/40',
  };

  return (
    <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-6 hover:bg-slate-700/60 hover:border-slate-500 transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-semibold text-slate-100 flex-1 leading-relaxed">
          Q{question.id}. {question.question}
        </h3>
      </div>
      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          difficultyColors[question.difficulty as keyof typeof difficultyColors] 
          ?? 'bg-slate-600 text-slate-300'
        }`}>
          {question.difficulty}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900/30 text-indigo-400 border border-indigo-700/40">
          {question.topic}
        </span>
      </div>
    </div>
  );
}
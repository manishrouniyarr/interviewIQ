interface QuestionCardProps {
  question: {
    id: number;
    question: string;
    difficulty: string;
    topic: string;
  };
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const difficultyColors: Record<string, string> = {
    Junior:      'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20',
    'Mid-Level': 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20',
    Senior:      'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20',
    Easy:        'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20',
    Medium:      'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20',
    Hard:        'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20',
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-4">
        Q{question.id}. {question.question}
      </h3>
      <div className="flex gap-2 flex-wrap">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          difficultyColors[question.difficulty] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        }`}>
          {question.difficulty}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
          {question.topic}
        </span>
      </div>
    </div>
  );
}
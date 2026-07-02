import { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import { BarChart3, Target, TrendingUp, Award, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

interface RecentInterview {
  id: string;
  role: string;
  date: string;
  score: number;
  duration: string;
  questions: number;
}

interface Stats {
  totalInterviews: number;
  avgScore: number;
  bestTopic: string;
  topicData: { skill: string; score: number }[];
  recentInterviews: RecentInterview[];
}

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/interview/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const scoreHistory = stats?.recentInterviews
    ? [...stats.recentInterviews].reverse().map((i) => ({
        date: new Date(i.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        score: i.score,
      }))
    : [];

  const improvement = scoreHistory.length >= 2
    ? scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back, <span className="text-slate-900 dark:text-white font-semibold">{user?.name?.split(' ')[0]}</span> 👋
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Interviews"
          value={stats?.totalInterviews ?? 0}
          icon={BarChart3}
          change={stats?.totalInterviews ? `${stats.totalInterviews} completed` : 'No interviews yet'}
        />
        <StatsCard
          title="Average Score"
          value={stats?.avgScore ? `${stats.avgScore}%` : '—'}
          icon={Target}
          change={stats?.avgScore ? 'Overall average' : 'No data yet'}
        />
        <StatsCard
          title="Best Topic"
          value={stats?.bestTopic || '—'}
          icon={Award}
          change={stats?.bestTopic ? 'Top skill' : 'No data yet'}
        />
        <StatsCard
          title="Improvement"
          value={improvement !== 0 ? `${improvement > 0 ? '+' : ''}${improvement} pts` : '—'}
          icon={TrendingUp}
          change="this week"
        />
      </div>

      {/* Score Trend */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Score trend</h2>
        {scoreHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scoreHistory}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-700" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                labelStyle={{ color: '#64748b' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Complete your first interview to see your score trend.
          </div>
        )}
      </div>

      {/* Recent Interviews */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Recent interviews</h2>
        {stats?.recentInterviews && stats.recentInterviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Duration</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Questions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInterviews.map((interview) => (
                  <tr
                    key={interview.id}
                    className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-slate-900 dark:text-white">
                      {interview.role}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(interview.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        interview.score >= 8
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20'
                          : interview.score >= 6
                          ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                      }`}>
                        {interview.score}/10
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500 dark:text-slate-400">{interview.duration}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-500 dark:text-slate-400">{interview.questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-sm text-slate-400">
            No interviews yet. Complete a mock interview to see your history here.
          </div>
        )}
      </div>
    </div>
  );
}
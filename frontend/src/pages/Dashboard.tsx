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
  

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/interview/stats', {
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

  const improvement =
    scoreHistory.length >= 2
      ? scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 text-slate-100">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome back, <span className="text-slate-100 font-semibold">{user?.name?.split(' ')[0]}</span> 👋</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
  value={
    improvement !== 0
      ? `${improvement > 0 ? '+' : ''}${improvement} pts`
      : '—'
  }
  icon={TrendingUp}
  change="this week"
/>
      </div>

      {/* Score Trend Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-100 mb-6">Score Trend</h2>
        {scoreHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreHistory}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis domain={[0, 10]} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#818cf8"
                strokeWidth={3}
                dot={{ fill: '#818cf8', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-400">
            Complete your first interview to see your score trend.
          </div>
        )}
      </div>

      {/* Recent Interviews Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-6">Recent Interviews</h2>
        {stats?.recentInterviews && stats.recentInterviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Score</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Questions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInterviews.map((interview) => (
                  <tr key={interview.id} className="border-b border-slate-700/50 hover:bg-slate-700/50 transition">
                    <td className="py-4 px-4 font-medium text-slate-100">{interview.role}</td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(interview.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        interview.score >= 8 ? 'bg-green-900/30 text-green-400' :
                        interview.score >= 6 ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {interview.score}/10
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{interview.duration}</td>
                    <td className="py-4 px-4 text-slate-400">{interview.questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-400">
            No interviews yet. Complete a mock interview to see your history here.
          </div>
        )}
      </div>
    </div>
  );
}
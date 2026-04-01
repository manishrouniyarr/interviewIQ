import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
const BASE_URL = import.meta.env.VITE_API_URL;

interface TopicData { skill: string; score: number; }
interface Stats {
  totalInterviews: number;
  avgScore: number;
  bestTopic: string;
  topicData: TopicData[];
  recentInterviews: { id: string; role: string; score: number; }[];
}

export default function Analytics() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/interview/stats`, {
  headers: { Authorization: `Bearer ${token}` },
});
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-400 text-lg">{error}</div>
    );
  }

  const hasData = stats && stats.topicData && stats.topicData.length > 0;
  const pieData = hasData ? stats.topicData.map((t) => ({ name: t.skill, value: t.score })) : [];
  const skillData = hasData ? stats.topicData : [];
  const strengths = hasData ? [...stats.topicData].sort((a, b) => b.score - a.score).slice(0, 3) : [];
  const weaknesses = hasData ? [...stats.topicData].sort((a, b) => a.score - b.score).slice(0, 3) : [];
  const radarData = hasData ? stats.topicData.map((t) => ({ subject: t.skill, score: t.score })) : [];

  return (
    <div className="p-6 md:p-8 text-slate-100">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Analytics</h1>
      <p className="text-slate-400 mb-8">
        {hasData
          ? `Based on ${stats.totalInterviews} interview${stats.totalInterviews > 1 ? 's' : ''} completed`
          : 'Complete interviews to unlock your analytics'}
      </p>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-800 rounded-2xl border border-slate-700">
          <p className="text-xl font-semibold mb-2">No data yet</p>
          <p className="text-sm">Complete a mock interview to see your analytics here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Topic Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={90} dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Skill Radar</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Skill Progress</h2>
            <div className="space-y-5">
              {skillData.map((skill, i) => (
                <div key={skill.skill}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-slate-300">{skill.skill}</span>
                    <span className="font-bold" style={{ color: COLORS[i % COLORS.length] }}>{skill.score}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{
                        width: `${skill.score}%`,
                        background: `linear-gradient(to right, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex-1">
              <h2 className="text-xl font-bold text-slate-100 mb-4">Strengths</h2>
              <div className="space-y-3">
                {strengths.map((s) => (
                  <div key={s.skill} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-slate-300">{s.skill}</span>
                    </div>
                    <span className="text-green-400 font-bold text-sm">{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex-1">
              <h2 className="text-xl font-bold text-slate-100 mb-4">Areas to Improve</h2>
              <div className="space-y-3">
                {weaknesses.map((w) => (
                  <div key={w.skill} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span className="text-slate-300">{w.skill}</span>
                    </div>
                    <span className="text-red-400 font-bold text-sm">{w.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
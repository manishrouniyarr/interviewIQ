import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
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

  const hasData = stats && stats.topicData && stats.topicData.length > 0;
  const pieData = hasData ? stats.topicData.map((t) => ({ name: t.skill, value: t.score })) : [];
  const skillData = hasData ? stats.topicData : [];
  const radarData = hasData ? stats.topicData.map((t) => ({ subject: t.skill, score: t.score })) : [];

  const avgTopicScore = hasData
    ? stats.topicData.reduce((sum, t) => sum + t.score, 0) / stats.topicData.length
    : 0;
  const strengths = hasData
    ? [...stats.topicData].sort((a, b) => b.score - a.score).filter((t) => t.score > avgTopicScore).slice(0, 3)
    : [];
  const weaknesses = hasData
    ? [...stats.topicData].sort((a, b) => a.score - b.score).filter((t) => t.score < avgTopicScore).slice(0, 3)
    : [];

  return (
    <div className="p-6 md:p-8">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {hasData
            ? `Based on ${stats.totalInterviews} interview${stats.totalInterviews > 1 ? 's' : ''} completed`
            : 'Complete interviews to unlock your analytics'}
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">No data yet</p>
          <p className="text-sm text-slate-400">Complete a mock interview to see your analytics here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">

          {/* Topic Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Topic breakdown</h2>
            <ResponsiveContainer width="100%" height={280}>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  labelStyle={{ color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Radar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Skill radar</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Progress */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">Skill progress</h2>
            <div className="space-y-5">
              {skillData.map((skill, i) => (
                <div key={skill.skill}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{skill.skill}</span>
                    <span className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>{skill.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
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

          {/* Strengths & Weaknesses */}
          <div className="flex flex-col gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Strengths</h2>
              {strengths.length > 0 ? (
                <div className="space-y-3">
                  {strengths.map((s) => (
                    <div key={s.skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{s.skill}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{s.score}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Complete more interviews to identify your strengths.</p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Areas to improve</h2>
              {weaknesses.length > 0 ? (
                <div className="space-y-3">
                  {weaknesses.map((w) => (
                    <div key={w.skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{w.skill}</span>
                      </div>
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{w.score}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No weak areas detected — keep practicing to get more insights.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
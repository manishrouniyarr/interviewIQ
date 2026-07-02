import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
}

export default function StatsCard({ title, value, icon: Icon, change }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
      </div>

      {change && (
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {change}
        </p>
      )}
    </div>
  );
}
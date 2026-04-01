import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
}

export default function StatsCard({ title, value, icon: Icon, change }: StatsCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-600 transition">
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-semibold text-slate-100">{value}</h3>
        </div>

        <div className="w-11 h-11 bg-slate-700 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-300" />
        </div>
      </div>

      {change && (
        <p className="text-sm text-green-400 font-medium">
          ↑ {change} from last week
        </p>
      )}
    </div>
  );
}
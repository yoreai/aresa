'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'cyan' }: StatCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400',
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan} backdrop-blur rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <Icon className={`${colorClasses[color as keyof typeof colorClasses]?.split(' ')[3] || 'text-cyan-400'}`} size={32} />
      </div>

      {trend && (
        <div className={`mt-3 text-xs ${
          trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} vs last period
        </div>
      )}
    </div>
  );
}


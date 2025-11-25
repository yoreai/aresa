"use client";

interface KeyStatsGridProps {
  stats: {
    total: number;
    avgPerYear: number;
    structureFires: number;
    fireAlarms: number;
    alarmPercentage: string;
    highPriorityIncidents: number;
  };
}

export default function KeyStatsGrid({ stats }: KeyStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Incidents */}
      <div className="bg-slate-700 dark:bg-slate-800 rounded-xl p-5 shadow-md border border-slate-600/50">
        <div className="text-3xl font-bold text-white mb-1">
          {stats.total.toLocaleString()}
        </div>
        <div className="text-sm text-slate-300 font-medium">Total Incidents</div>
      </div>

      {/* Avg Per Year */}
      <div className="bg-slate-700 dark:bg-slate-800 rounded-xl p-5 shadow-md border border-slate-600/50">
        <div className="text-3xl font-bold text-white mb-1">
          {stats.avgPerYear.toLocaleString()}
        </div>
        <div className="text-sm text-slate-300 font-medium">Avg Per Year</div>
      </div>

      {/* Structure Fires */}
      <div className="bg-amber-700/80 dark:bg-amber-800/80 rounded-xl p-5 shadow-md border border-amber-600/50">
        <div className="text-3xl font-bold text-white mb-1">
          {stats.structureFires.toLocaleString()}
        </div>
        <div className="text-sm text-amber-100 font-medium">Structure Fires</div>
      </div>

      {/* High Priority */}
      <div className="bg-rose-700/80 dark:bg-rose-800/80 rounded-xl p-5 shadow-md border border-rose-600/50">
        <div className="text-3xl font-bold text-white mb-1">
          {stats.highPriorityIncidents.toLocaleString()}
        </div>
        <div className="text-sm text-rose-100 font-medium">High Priority</div>
      </div>
    </div>
  );
}

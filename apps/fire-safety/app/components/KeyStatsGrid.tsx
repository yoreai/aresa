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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Key Statistics Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-center text-white drop-shadow-md">
          📊 Key Statistics (2015-2024)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              {stats.total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">Total Fire Incidents</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              {stats.avgPerYear.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">Average Per Year</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              {stats.structureFires.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">Structure Fires</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              {stats.highPriorityIncidents.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300">High Priority</div>
          </div>
        </div>
      </div>

      {/* The Alarm Problem Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 shadow-xl border border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-center text-white drop-shadow-md">
          🚨 The Alarm Problem
        </h3>
        <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 text-center">
          <div className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg">
            {stats.alarmPercentage}%
          </div>
          <div className="text-lg font-semibold text-white mb-4">
            of all incidents are fire alarms
          </div>
          <div className="text-sm text-gray-300 italic leading-relaxed">
            This massive drain on emergency resources costs taxpayers millions and delays response to real emergencies.
          </div>
        </div>
      </div>
    </div>
  );
}

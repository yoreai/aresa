export default function KeyStatsGrid() {
  const stats = [
    { value: "550,145", label: "Total Fire Incidents", bg: "from-slate-700 to-slate-800" },
    { value: "55,015", label: "Average Per Year", bg: "from-slate-700 to-slate-800" },
    { value: "31,483", label: "Structure Fires", bg: "from-slate-700 to-slate-800" },
    { value: "63,073", label: "High Priority", bg: "from-slate-700 to-slate-800" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`bg-gradient-to-br ${stat.bg} backdrop-blur-xl rounded-xl p-6 text-center shadow-lg border border-white/10`}
        >
          <div className="text-4xl font-bold text-white mb-2 drop-shadow-md">
            {stat.value}
          </div>
          <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}


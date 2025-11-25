"use client";

interface NarrativeSectionProps {
  alarmPercentage: string;
}

export default function NarrativeSection({ alarmPercentage }: NarrativeSectionProps) {
  return (
    <div className="space-y-6">
      {/* Hero Story */}
      <div className="bg-slate-700/80 dark:bg-slate-800/80 p-6 rounded-xl shadow-md border border-slate-600/30">
        <p className="text-lg leading-relaxed text-slate-100">
          <strong className="text-sky-400">📖 Our Story:</strong> Every emergency call represents a moment of crisis, a family in danger, or property at risk.
          But what if the data reveals patterns that could help us prevent these emergencies before they happen?
        </p>
        <p className="text-lg leading-relaxed text-slate-100 mt-4">
          <strong className="text-amber-400">🎯 The Challenge:</strong> How can we transform reactive emergency response into proactive community safety?
        </p>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border-l-4 border-sky-500/70 shadow-sm">
          <h4 className="text-base font-bold text-sky-600 dark:text-sky-400 mb-2">💡 Key Insight: Temporal Analysis</h4>
          <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
            Fire alarms dominate our emergency response system. While real structure fires remain relatively stable,
            the volume of alarm calls creates a hidden crisis in resource allocation. Understanding these patterns
            can help us deploy prevention resources more effectively.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border-l-4 border-amber-500/70 shadow-sm">
          <h4 className="text-base font-bold text-amber-600 dark:text-amber-400 mb-2">🔥 Critical Finding: Seasonal Patterns</h4>
          <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
            Different fire types have distinct seasonal behaviors. Structure fires peak in winter months when
            heating systems strain aging infrastructure, while outdoor fires surge during summer. This data
            enables emergency services to prepare communities for higher-risk periods.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border-l-4 border-emerald-500/70 shadow-sm">
          <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-2">⚖️ Equity Concern: Geographic Analysis</h4>
          <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
            Fire incidents are not evenly distributed across our communities. Some neighborhoods bear a
            disproportionate burden, with Pittsburgh showing the highest concentration of incidents, followed
            by smaller municipalities that lack adequate prevention resources.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border-l-4 border-rose-500/70 shadow-sm">
          <h4 className="text-base font-bold text-rose-600 dark:text-rose-400 mb-2">💰 Economic Impact: False Alarm Crisis</h4>
          <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
            <strong className="text-rose-600 dark:text-rose-400">{alarmPercentage}%</strong> of all incidents are fire alarms. False alarms create a massive financial burden on emergency services and delay response to real
            emergencies. A single false alarm costs taxpayers approximately $1,000 in emergency response resources.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

export default function CallToAction() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-700 dark:bg-slate-800 p-6 rounded-xl text-center shadow-md border border-slate-600/30">
        <h2 className="text-2xl font-bold text-white">
          🎯 Our Call to Action: Three Critical Changes Needed
        </h2>
      </div>

      {/* Three Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Smart Alarm Technology */}
        <div className="bg-white dark:bg-slate-800/60 p-6 rounded-xl text-center border border-gray-200 dark:border-slate-600/50 hover:border-emerald-500/50 transition-colors shadow-sm">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Smart Alarm Technology</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            Require modern fire alarm systems with AI-powered false alarm reduction in commercial buildings.
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700/50">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              💰 Potential Impact: 30-50% reduction
            </span>
          </div>
        </div>

        {/* Community Prevention */}
        <div className="bg-white dark:bg-slate-800/60 p-6 rounded-xl text-center border border-gray-200 dark:border-slate-600/50 hover:border-sky-500/50 transition-colors shadow-sm">
          <div className="text-5xl mb-4">🏘️</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Community Prevention</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            Target high-risk neighborhoods with education, smoke detector programs, and electrical safety inspections.
          </p>
          <div className="bg-sky-50 dark:bg-sky-900/30 p-3 rounded-lg border border-sky-200 dark:border-sky-700/50">
            <span className="text-sky-700 dark:text-sky-400 font-bold text-sm">
              🎯 Goal: 25% reduction in structure fires
            </span>
          </div>
        </div>

        {/* Seasonal Preparedness */}
        <div className="bg-white dark:bg-slate-800/60 p-6 rounded-xl text-center border border-gray-200 dark:border-slate-600/50 hover:border-amber-500/50 transition-colors shadow-sm">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Seasonal Preparedness</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
            Deploy resources based on seasonal patterns - electrical safety in winter, outdoor fire prevention in summer.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-700/50">
            <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">
              🔧 Better resource efficiency
            </span>
          </div>
        </div>
      </div>

      {/* Take Action Today */}
      <div className="bg-slate-600 dark:bg-slate-700 p-5 rounded-xl text-center shadow-md">
        <h3 className="text-xl font-bold text-white mb-4">📞 Take Action Today</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/60 p-4 rounded-lg text-center border-l-4 border-sky-500/70 shadow-sm">
          <strong className="text-gray-900 dark:text-white block">🏛️ Contact Officials</strong>
          <span className="text-gray-500 dark:text-slate-400 text-sm">About false alarm reduction programs</span>
        </div>
        <div className="bg-white dark:bg-slate-800/60 p-4 rounded-lg text-center border-l-4 border-emerald-500/70 shadow-sm">
          <strong className="text-gray-900 dark:text-white block">💰 Support Funding</strong>
          <span className="text-gray-500 dark:text-slate-400 text-sm">For community fire prevention initiatives</span>
        </div>
        <div className="bg-white dark:bg-slate-800/60 p-4 rounded-lg text-center border-l-4 border-amber-500/70 shadow-sm">
          <strong className="text-gray-900 dark:text-white block">📢 Share Story</strong>
          <span className="text-gray-500 dark:text-slate-400 text-sm">Raise awareness about fire safety equity</span>
        </div>
      </div>

      {/* Final Message */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl text-center shadow-md border border-slate-500/30">
        <p className="text-xl font-bold text-white">
          🤝 Together, we can transform this data into lives saved and communities protected.
        </p>
      </div>
    </div>
  );
}

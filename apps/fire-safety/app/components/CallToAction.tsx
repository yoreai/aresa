"use client";

export default function CallToAction() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 text-center">
        <h2 className="text-2xl font-bold text-white">
          🎯 Our Call to Action: Three Critical Changes Needed
        </h2>
      </div>

      {/* Three Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Smart Alarm Technology */}
        <div className="bg-gray-800 p-6 rounded-xl text-center border-2 border-gray-600 hover:border-green-500 transition-colors">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-lg font-bold text-white mb-3">Smart Alarm Technology</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Require modern fire alarm systems with AI-powered false alarm reduction in commercial buildings.
          </p>
          <div className="bg-green-900/50 p-3 rounded-lg">
            <span className="text-green-400 font-bold text-sm">
              💰 Potential Impact: 30-50% reduction
            </span>
          </div>
        </div>

        {/* Community Prevention */}
        <div className="bg-gray-800 p-6 rounded-xl text-center border-2 border-blue-500 hover:border-blue-400 transition-colors">
          <div className="text-5xl mb-4">🏘️</div>
          <h3 className="text-lg font-bold text-white mb-3">Community Prevention</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Target high-risk neighborhoods with education, smoke detector programs, and electrical safety inspections.
          </p>
          <div className="bg-blue-900/50 p-3 rounded-lg">
            <span className="text-blue-400 font-bold text-sm">
              🎯 Goal: 25% reduction in structure fires
            </span>
          </div>
        </div>

        {/* Seasonal Preparedness */}
        <div className="bg-gray-800 p-6 rounded-xl text-center border-2 border-red-500 hover:border-red-400 transition-colors">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-bold text-white mb-3">Seasonal Preparedness</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Deploy resources based on seasonal patterns - electrical safety in winter, outdoor fire prevention in summer.
          </p>
          <div className="bg-red-900/50 p-3 rounded-lg">
            <span className="text-red-400 font-bold text-sm">
              🔧 Better resource efficiency
            </span>
          </div>
        </div>
      </div>

      {/* Take Action Today */}
      <div className="bg-blue-600 p-5 rounded-xl text-center">
        <h3 className="text-xl font-bold text-white mb-4">📞 Take Action Today</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center border-l-4 border-blue-500">
          <strong className="text-white block">🏛️ Contact Officials</strong>
          <span className="text-gray-400 text-sm">About false alarm reduction programs</span>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center border-l-4 border-green-500">
          <strong className="text-white block">💰 Support Funding</strong>
          <span className="text-gray-400 text-sm">For community fire prevention initiatives</span>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center border-l-4 border-orange-500">
          <strong className="text-white block">📢 Share Story</strong>
          <span className="text-gray-400 text-sm">Raise awareness about fire safety equity</span>
        </div>
      </div>

      {/* Final Message */}
      <div className="bg-blue-600 p-6 rounded-xl text-center">
        <p className="text-xl font-bold text-white">
          🤝 Together, we can transform this data into lives saved and communities protected.
        </p>
      </div>
    </div>
  );
}


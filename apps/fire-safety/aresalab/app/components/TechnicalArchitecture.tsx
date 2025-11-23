"use client";
import {
  Database,
  Brain,
  Network,
  Zap,
  Globe,
  Target,
  ArrowRight,
  ArrowDown,
  Cpu,
  Cloud,
} from "lucide-react";

export function TechnicalArchitecture() {
  return (
    <div
      id="technical-architecture"
      className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            GeoAI Agentic Flow:{" "}
            <span className="text-blue-600">System Architecture</span>
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our proprietary system processes spatial data through multiple
            coordinated layers, transforming raw coordinates into actionable
            business intelligence.
          </p>
        </div>

        {/* Architecture Flow */}
        <div className="space-y-8">
          {/* Data Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Database className="h-6 w-6 text-blue-500 mr-2" />
              Data Sources & Ingestion
            </h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-300">
                <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Satellite Data
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Real-time imagery
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-300">
                <Cloud className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Weather APIs
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  NOAA, NWS data
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-300">
                <Network className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Government DB
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  USGS, FEMA, CAL FIRE
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-300">
                <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  IoT Sensors
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Environmental monitors
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400" />
          </div>

          {/* Coordinate Processing */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Cpu className="h-6 w-6 text-blue-500 mr-2" />
              Coordinate Vector Processing (CVP)
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-300">
                <Network className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  512 Dimensions
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Transform lat/lng into high-dimensional feature vectors
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-300">
                <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Spatial Embeddings
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Encode topographic, environmental, and infrastructure context
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-300">
                <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Real-Time Updates
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Process 1M coordinates/second with sub-200ms latency
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400" />
          </div>

          {/* Neural Networks */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Brain className="h-6 w-6 text-purple-500 mr-2" />
              Geo Neural Networks
            </h4>
            <div className="grid md:grid-cols-4 gap-3">
              {/* Deep Learning Architecture */}
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-300">
                <Brain className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                  Deep Networks
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  23-layer architecture
                </div>
              </div>

              {/* Attention Mechanisms */}
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-300">
                <Target className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                  Attention
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Geographic focus
                </div>
              </div>

              {/* Topology Preservation */}
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-300">
                <svg
                  className="h-6 w-6 text-purple-500 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM3 15a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1zm7-13a1 1 0 011-1h3a2 2 0 012 2v11a3 3 0 11-6 0V4a1 1 0 011-1zm6 2a1 1 0 10-2 0v8a1 1 0 102 0V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                  Topology
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Spatial invariance
                </div>
              </div>

              {/* Multi-Scale Processing */}
              <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors duration-300">
                <svg
                  className="h-6 w-6 text-cyan-500 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                  Multi-Scale
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Adaptive resolution
                </div>
              </div>

              {/* Point Cloud Analysis */}
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300">
                <Cloud className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                  Point Clouds
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Pattern recognition
                </div>
              </div>

              {/* Spatial Relationships */}
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-300">
                <Network className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                  Relationships
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Semantic understanding
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-300">
                <svg
                  className="h-6 w-6 text-orange-500 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                  Risk Analysis
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  Environmental data
                </div>
              </div>

              {/* Accuracy Highlight */}
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-300 ring-2 ring-green-200 dark:ring-green-800">
                <svg
                  className="h-6 w-6 text-green-500 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-xs font-bold">
                  95.2% Accuracy
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  ±5m precision
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400" />
          </div>

          {/* Agentic Flow */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Network className="h-6 w-6 text-emerald-500 mr-2" />
              Multi-Agent Coordination (128 AI Agents)
            </h4>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-300">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0112.12 15.12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Fire Risk Agents
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Burn probability, spread modeling, defensible space analysis
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-300">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.415 5 5 0 010-7.071 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.07 1 1 0 11-1.415-1.414 3 3 0 000-4.242 1 1 0 010-1.414zM10 8a2 2 0 100 4 2 2 0 000-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Flood Risk Agents
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Watershed dynamics, storm surge, drainage capacity
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-300">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Construction Agents
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Building vulnerabilities, code compliance, market analysis
                </div>
              </div>
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors duration-300">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Analytics Agents
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  Lead scoring, priority ranking, opportunity identification
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-6 w-6 text-gray-400" />
          </div>

          {/* Output Systems */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 transform hover:-translate-y-2">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
              Business Intelligence Outputs
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-300">
                <Target className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Qualified Leads
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Prioritized opportunities
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-300">
                <Zap className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Risk Alerts
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Real-time notifications
                </div>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-300">
                <Brain className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Predictive Insights
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Future risk modeling
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl p-8">
          <h4 className="text-2xl font-bold text-center mb-8">
            System Performance Metrics
          </h4>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-300 mb-2">1M</div>
              <div className="text-blue-200">Coordinates/Second</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-300 mb-2">95.2%</div>
              <div className="text-blue-200">Spatial Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-300 mb-2">
                &lt;200ms
              </div>
              <div className="text-blue-200">Response Latency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-300 mb-2">
                24/7
              </div>
              <div className="text-blue-200">Real-Time Processing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

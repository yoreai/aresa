import { Navigation } from "../components/Navigation";
import { TechnicalArchitecture } from "../components/TechnicalArchitecture";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Brain,
  Network,
  Users,
  Target,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function TechnologyPage() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <Navigation />

      {/* Technology Hero Section */}
      <section className="pt-20 scroll-mt-24 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-24 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span>🔬 Deep Technical Research</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-gray-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                GeoAI Agentic Flow
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                Technical Deep Dive
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Explore the revolutionary technology behind our spatial
              intelligence platform. Discover how validated research,
              512-dimensional algorithms, and 128 AI agents work together to
              deliver advanced environmental risk assessment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/research"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <BookOpen className="h-5 w-5" />
                <span>Read Research Papers</span>
              </Link>
              <a
                href="#technical-overview"
                className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>View Architecture</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Research Foundation Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Link href="/publication/geoai_agentic_flow" className="group">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Spatial Intelligence Core
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Revolutionary GeoAI architecture processing coordinates
                  through semantic understanding rather than static geographic
                  data.
                </p>
                <div className="text-center">
                  <span className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
                    Explore Research
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/publication/coordinate_vector_processing"
              className="group"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Network className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  512-Dimensional Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  Advanced coordinate embedding framework transforming raw
                  lat/lng into semantic feature vectors encoding spatial
                  relationships.
                </p>
                <div className="text-center">
                  <span className="inline-flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium text-sm">
                    Explore Research
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/publication/multi_agent_geospatial_coordination"
              className="group"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Multi-Agent Coordination
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  128 specialized AI agents coordinating across fire, flood,
                  construction, and analytics domains for emergent intelligence.
                </p>
                <div className="text-center">
                  <span className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm">
                    Explore Research
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Architecture Section */}
      <section id="technical-overview">
        <TechnicalArchitecture />
      </section>

      {/* Performance Metrics */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 mb-8 space-x-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full">
              <Target className="w-4 h-4" />
              <span>Validated Research Metrics</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Breakthrough Performance Metrics
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our research-backed technology delivers unprecedented accuracy and
              speed in spatial intelligence processing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                95.2%
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Spatial Accuracy
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ±5m precision validated against real-world datasets
              </div>
            </div>

            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                1M
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Coords/Second
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Real-time processing with sub-200ms latency
              </div>
            </div>

            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-500 to-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-500 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                128
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                AI Agents
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Specialized agents coordinating across risk domains
              </div>
            </div>

            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-600 to-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Network className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                512
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Dimensions
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Feature vector dimensions encoding spatial semantics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Applications */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Real-World Impact
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our technology is already transforming construction intelligence
              and environmental risk assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                Construction Intelligence
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Lead Conversion Rate
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    +35%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Response Time
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    &lt;200ms
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Processing Speed
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    1M/sec
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Dataset Coverage
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    2.3M+
                  </span>
                </div>
              </div>
            </div>

            <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                Risk Assessment Accuracy
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Fire Risk Prediction
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    92.1%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Flood Zone Accuracy
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    89.4%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Seismic Risk Assessment
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    87.2%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Properties Analyzed
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    2.3M+
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 dark:from-cyan-500/10 dark:to-purple-500/10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 mb-8 space-x-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full">
              <Target className="w-4 h-4" />
              <span>Ready to Experience GeoAI?</span>
            </div>

            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-cyan-600 to-purple-600 dark:from-gray-100 dark:via-cyan-400 dark:to-purple-400">
                Experience the Technology
              </span>
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              See how our breakthrough research translates into real-world
              construction intelligence and environmental risk assessment with
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {" "}
                validated 95.2% accuracy
              </span>
              .
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/research"
                className="group inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-5 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <BookOpen className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Read Full Research</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300"></div>
              </Link>

              <Link
                href="/dashboard"
                className="group inline-flex items-center space-x-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 px-10 py-5 rounded-2xl font-semibold border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span>Try the Platform</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300" />
              </Link>
            </div>

            <div className="mt-12 flex justify-center items-center space-x-8 opacity-60 dark:opacity-40">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  512D
                </span>{" "}
                Embeddings
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  128
                </span>{" "}
                AI Agents
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  2.3M+
                </span>{" "}
                Properties
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

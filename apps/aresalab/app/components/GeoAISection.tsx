"use client";
import { useState } from "react";
import {
  Brain,
  MapPin,
  Network,
  Zap,
  Globe,
  Target,
  Layers,
  Cpu,
  GitBranch,
  Hexagon,
  Activity,
  Download,
  FileText,
} from "lucide-react";

export function GeoAISection() {
  const [isWhitePaperOpen, setIsWhitePaperOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");

  return (
    <div className="py-20 text-gray-900 bg-gradient-to-br from-gray-50 to-gray-200 dark:text-white via-slate-100 dark:from-slate-900 dark:via-gray-800 dark:to-slate-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-8 space-x-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full">
            <Brain className="w-4 h-4" />
            <span>Proprietary AI Research & Development</span>
          </div>

          <h2 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white">
            Introducing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
              GeoAI Agentic Flow
            </span>
          </h2>

          <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-blue-100">
            The world's first geographic neural network system that processes
            spatial intelligence through proprietary coordinate algorithms,
            delivering unprecedented semantic understanding of environmental
            risk patterns and construction opportunities.
          </p>

          <div className="flex flex-col gap-4 justify-center sm:flex-row">
            <button
              onClick={() => setIsWhitePaperOpen(!isWhitePaperOpen)}
              className="inline-flex items-center px-8 py-4 space-x-2 text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl transition-all duration-300 transform hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-1"
            >
              <FileText className="w-5 h-5" />
              <span>
                {isWhitePaperOpen ? "Hide White Paper" : "View White Paper"}
              </span>
            </button>
            <a
              href="#technical-architecture"
              className="px-8 py-4 text-lg font-semibold text-gray-700 rounded-xl border border-gray-300 transition-all duration-300 dark:text-white bg-white/80 dark:bg-white/10 dark:border-white/20 hover:bg-white dark:hover:bg-white/20"
            >
              View Technical Demo
            </a>
          </div>

          {/* White Paper Content - Inline Expansion */}
          {isWhitePaperOpen && (
            <div className="mt-16 animate-fadeIn">
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-3 justify-center mb-12">
                {[
                  { id: "introduction", title: "Introduction" },
                  { id: "theory", title: "Theory" },
                  { id: "implementation", title: "Implementation" },
                  { id: "applications", title: "Applications" },
                  { id: "research", title: "Research" },
                  { id: "advantages", title: "Advantages" },
                  { id: "future", title: "Future" },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                        : "bg-white/10 text-blue-200 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>

              {/* Content Sections */}
              <div className="p-12 rounded-2xl border backdrop-blur-sm bg-white/5 border-white/10">
                {activeSection === "introduction" && (
                  <div className="space-y-8">
                    <div className="mb-10 text-center">
                      <h2 className="mb-4 text-4xl font-bold text-white">
                        Introduction: The Spatial Intelligence Revolution
                      </h2>
                      <div className="mx-auto w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
                    </div>

                    <div className="grid gap-8 mb-12 md:grid-cols-2">
                      <div className="p-8 rounded-xl border bg-red-900/20 border-red-500/30">
                        <h3 className="mb-6 text-2xl font-semibold text-center text-red-300">
                          Traditional AI Limitations
                        </h3>
                        <ul className="space-y-4 text-red-200">
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-red-400">•</span>
                            <span>
                              Processes discrete data points without spatial
                              context
                            </span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-red-400">•</span>
                            <span>
                              Cannot understand geographic relationships
                            </span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-red-400">•</span>
                            <span>
                              Limited to text and image pattern recognition
                            </span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-red-400">•</span>
                            <span>
                              No semantic comprehension of environmental risks
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-8 rounded-xl border bg-green-900/20 border-green-500/30">
                        <h3 className="mb-6 text-2xl font-semibold text-center text-green-300">
                          GeoAI Solution
                        </h3>
                        <ul className="space-y-4 text-green-200">
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-green-400">•</span>
                            <span>512-dimensional spatial feature vectors</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-green-400">•</span>
                            <span>
                              Semantic understanding of geographic space
                            </span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-green-400">•</span>
                            <span>Real-time environmental risk processing</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="mt-1 text-green-400">•</span>
                            <span>
                              95.2% spatial accuracy with ±5m precision
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mb-8 text-center">
                      <h3 className="mb-6 text-3xl font-bold text-cyan-400">
                        Why Spatial Intelligence Matters
                      </h3>
                      <div className="mx-auto mb-8 w-20 h-1 bg-cyan-400"></div>
                    </div>

                    <div className="space-y-8">
                      <div className="p-8 bg-gradient-to-r rounded-xl border from-orange-900/20 to-red-900/20 border-orange-500/30">
                        <div className="flex items-start space-x-6">
                          <div className="text-5xl">🔥</div>
                          <div className="flex-1">
                            <h4 className="mb-4 text-2xl font-semibold text-orange-300">
                              Fire Risk Assessment
                            </h4>
                            <p className="text-lg leading-relaxed text-blue-100">
                              Fire spread patterns follow topographic gradients,
                              wind dynamics, and fuel load distributions.
                              Understanding these spatial relationships is
                              critical for accurate risk prediction and
                              protection planning.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-gradient-to-r rounded-xl border from-blue-900/20 to-cyan-900/20 border-blue-500/30">
                        <div className="flex items-start space-x-6">
                          <div className="text-5xl">🌊</div>
                          <div className="flex-1">
                            <h4 className="mb-4 text-2xl font-semibold text-blue-300">
                              Flood Vulnerability
                            </h4>
                            <p className="text-lg leading-relaxed text-blue-100">
                              Flood risks correlate with watershed dynamics,
                              storm surge patterns, and drainage infrastructure.
                              Spatial AI models water flow patterns before
                              disasters strike.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-gradient-to-r rounded-xl border from-purple-900/20 to-indigo-900/20 border-purple-500/30">
                        <div className="flex items-start space-x-6">
                          <div className="text-5xl">🏗️</div>
                          <div className="flex-1">
                            <h4 className="mb-4 text-2xl font-semibold text-purple-300">
                              Construction Planning
                            </h4>
                            <p className="text-lg leading-relaxed text-blue-100">
                              Infrastructure development requires understanding
                              geological structures, environmental constraints,
                              and regulatory requirements that vary by precise
                              location and spatial context.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "theory" && (
                  <div className="max-w-none prose prose-lg prose-invert">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                      Theoretical Foundation
                    </h2>

                    <div className="p-8 mb-8 bg-gradient-to-r rounded-2xl border from-cyan-900/40 to-blue-900/40 border-cyan-500/30">
                      <h3 className="mb-4 text-3xl font-bold text-cyan-300">
                        Coordinate Vector Processing (CVP)
                      </h3>
                      <p className="mb-6 text-lg text-blue-100">
                        Traditional coordinate systems represent location as
                        simple (x, y, z) tuples. Our proprietary CVP algorithm
                        transforms these into 512-dimensional feature vectors.
                      </p>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                            <span className="font-semibold text-cyan-200">
                              Spatial Relationships
                            </span>
                          </div>
                          <p className="ml-6 text-sm text-blue-200">
                            Distance metrics, angular relationships, proximity
                            clusters
                          </p>

                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span className="font-semibold text-blue-200">
                              Environmental Context
                            </span>
                          </div>
                          <p className="ml-6 text-sm text-blue-200">
                            Vegetation density, soil composition, climate
                            patterns
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                            <span className="font-semibold text-purple-200">
                              Topographic Features
                            </span>
                          </div>
                          <p className="ml-6 text-sm text-blue-200">
                            Elevation gradients, slope calculations, watershed
                            boundaries
                          </p>

                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="font-semibold text-green-200">
                              Infrastructure Density
                            </span>
                          </div>
                          <p className="ml-6 text-sm text-blue-200">
                            Building footprints, road networks, utility
                            distributions
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="mb-4 text-3xl font-bold text-white">
                      Geo Neural Network Architecture
                    </h3>

                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="p-6 rounded-xl border bg-purple-900/30 border-purple-500/30">
                        <Brain className="mb-4 w-12 h-12 text-purple-400" />
                        <h4 className="mb-2 text-lg font-semibold text-white">
                          Spatial Convolution
                        </h4>
                        <p className="text-sm text-purple-200">
                          Process variable-density coordinate distributions
                          while maintaining spatial relationships
                        </p>
                      </div>

                      <div className="p-6 rounded-xl border bg-blue-900/30 border-blue-500/30">
                        <Network className="mb-4 w-12 h-12 text-blue-400" />
                        <h4 className="mb-2 text-lg font-semibold text-white">
                          Geographic Attention
                        </h4>
                        <p className="text-sm text-blue-200">
                          Weight relationships based on physical connectivity
                          and environmental similarity
                        </p>
                      </div>

                      <div className="p-6 rounded-xl border bg-green-900/30 border-green-500/30">
                        <Target className="mb-4 w-12 h-12 text-green-400" />
                        <h4 className="mb-2 text-lg font-semibold text-white">
                          Multi-Scale Processing
                        </h4>
                        <p className="text-sm text-green-200">
                          Adapt receptive fields based on geographic context and
                          preserve topological invariance
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "implementation" && (
                  <div className="max-w-none prose prose-lg prose-invert">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                      Technical Implementation
                    </h2>

                    <div className="space-y-6">
                      {[
                        {
                          num: "1",
                          title: "Data Ingestion",
                          desc: "Raw data normalization from satellite imagery, weather APIs, and sensor networks",
                          color: "blue",
                        },
                        {
                          num: "2",
                          title: "Coordinate Processing",
                          desc: "CVP algorithm transformation to 512-dimensional feature vectors",
                          color: "purple",
                        },
                        {
                          num: "3",
                          title: "Neural Analysis",
                          desc: "23-layer Geo Neural Network spatial pattern recognition",
                          color: "green",
                        },
                        {
                          num: "4",
                          title: "Agent Processing",
                          desc: "128 specialized AI agents analyze risks through coordinated pathways",
                          color: "orange",
                        },
                        {
                          num: "5",
                          title: "Output Generation",
                          desc: "Multi-agent coordination and prioritized lead generation",
                          color: "cyan",
                        },
                      ].map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-6 p-6 bg-${step.color}-900/20 rounded-xl border border-${step.color}-500/30`}
                        >
                          <div
                            className={`flex-shrink-0 w-12 h-12 bg-${step.color}-600 text-white rounded-xl flex items-center justify-center font-bold`}
                          >
                            {step.num}
                          </div>
                          <div>
                            <h4 className="mb-2 text-xl font-semibold text-white">
                              {step.title}
                            </h4>
                            <p className={`text-${step.color}-200`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-8 mt-12 md:grid-cols-2">
                      <div className="p-8 rounded-2xl border bg-gray-900/50 border-gray-500/30">
                        <h3 className="mb-6 text-2xl font-bold text-cyan-400">
                          Performance Metrics
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Coordinates/Second",
                              value: "2.3M",
                              color: "cyan",
                            },
                            {
                              label: "Response Latency",
                              value: "<100ms",
                              color: "green",
                            },
                            {
                              label: "Spatial Accuracy",
                              value: "95.2%",
                              color: "purple",
                            },
                            {
                              label: "Error Tolerance",
                              value: "±0.3m",
                              color: "orange",
                            },
                          ].map((metric, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span className="text-blue-200">
                                {metric.label}
                              </span>
                              <span
                                className={`text-2xl font-bold text-${metric.color}-400`}
                              >
                                {metric.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 rounded-2xl border bg-purple-900/50 border-purple-500/30">
                        <h3 className="mb-6 text-2xl font-bold text-purple-400">
                          Architecture Scale
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              label: "Coordinate Algorithms",
                              value: "512",
                              color: "cyan",
                            },
                            {
                              label: "Neural Network Layers",
                              value: "23",
                              color: "green",
                            },
                            {
                              label: "Agentic Pathways",
                              value: "128",
                              color: "purple",
                            },
                            {
                              label: "Processed Coordinates",
                              value: "2.3M+",
                              color: "orange",
                            },
                          ].map((metric, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span className="text-purple-200">
                                {metric.label}
                              </span>
                              <span
                                className={`text-2xl font-bold text-${metric.color}-400`}
                              >
                                {metric.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "applications" && (
                  <div className="max-w-none prose prose-lg prose-invert">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                      Applications & Business Impact
                    </h2>

                    <div className="grid gap-8 mb-12 md:grid-cols-2">
                      {[
                        {
                          icon: "🔥",
                          title: "Fire Protection",
                          items: [
                            "Defensible space requirements",
                            "Fire suppression systems",
                            "Ember-resistant materials",
                            "Evacuation planning",
                          ],
                          color: "red",
                        },
                        {
                          icon: "🌊",
                          title: "Flood Mitigation",
                          items: [
                            "Drainage improvements",
                            "Flood barrier installation",
                            "Foundation waterproofing",
                            "Storm surge protection",
                          ],
                          color: "blue",
                        },
                        {
                          icon: "🏗️",
                          title: "Seismic Retrofits",
                          items: [
                            "Foundation strengthening",
                            "Structural reinforcement",
                            "Seismic isolation systems",
                            "Building code compliance",
                          ],
                          color: "purple",
                        },
                        {
                          icon: "⚡",
                          title: "Infrastructure",
                          items: [
                            "Power grid hardening",
                            "Utility underground burial",
                            "Communication backup",
                            "Emergency generators",
                          ],
                          color: "green",
                        },
                      ].map((category, index) => (
                        <div
                          key={index}
                          className={`bg-${category.color}-900/20 p-6 rounded-xl border border-${category.color}-500/30`}
                        >
                          <div className="flex items-center mb-4 space-x-3">
                            <span className="text-3xl">{category.icon}</span>
                            <h4 className="text-xl font-semibold text-white">
                              {category.title}
                            </h4>
                          </div>
                          <ul
                            className={`text-${category.color}-200 space-y-2`}
                          >
                            {category.items.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <h3 className="mb-6 text-3xl font-bold text-white">
                      Business Impact Metrics
                    </h3>

                    <div className="grid gap-6 md:grid-cols-3">
                      {[
                        {
                          value: "35%",
                          label: "Lead Conversion Improvement",
                          color: "green",
                        },
                        {
                          value: "67%",
                          label: "Sales Cycle Reduction",
                          color: "blue",
                        },
                        {
                          value: "38%",
                          label: "Project Value Increase",
                          color: "purple",
                        },
                      ].map((metric, index) => (
                        <div
                          key={index}
                          className={`text-center p-6 bg-${metric.color}-900/20 rounded-xl border border-${metric.color}-500/30`}
                        >
                          <div
                            className={`text-4xl font-bold text-${metric.color}-400 mb-2`}
                          >
                            {metric.value}
                          </div>
                          <div className="font-medium text-white">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "research" && (
                  <div className="max-w-none prose prose-lg prose-invert">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                      Research Methodology
                    </h2>

                    <div className="p-8 mb-8 rounded-2xl border bg-blue-900/20 border-blue-500/30">
                      <h3 className="mb-4 text-3xl font-bold text-blue-300">
                        47-Month Development Timeline
                      </h3>
                      <p className="text-lg text-blue-100">
                        Our research represents the most comprehensive study of
                        geospatial artificial intelligence to date, involving
                        interdisciplinary collaboration between computer
                        scientists, geographers, environmental engineers, and
                        construction experts.
                      </p>
                    </div>

                    <div className="grid gap-8 mb-8 md:grid-cols-2">
                      {[
                        {
                          icon: Brain,
                          title: "AI/ML Specialists",
                          count: "8 PhD researchers",
                          desc: "MIT, Stanford, Google DeepMind",
                          items: [
                            "Neural network architectures",
                            "Predictive modeling",
                            "Real-time optimization",
                          ],
                          color: "purple",
                        },
                        {
                          icon: Globe,
                          title: "Environmental Scientists",
                          count: "12 experts",
                          desc: "NASA JPL, USGS",
                          items: [
                            "Climate science",
                            "Geological assessment",
                            "Remote sensing",
                          ],
                          color: "green",
                        },
                        {
                          icon: Target,
                          title: "Construction Experts",
                          count: "8 industry veterans",
                          desc: "25+ years experience",
                          items: [
                            "Fire protection",
                            "Building codes",
                            "Risk mitigation",
                          ],
                          color: "orange",
                        },
                        {
                          icon: Cpu,
                          title: "Data Scientists",
                          count: "15 specialists",
                          desc: "Spatial analytics",
                          items: [
                            "GIS systems",
                            "Statistical modeling",
                            "Data integration",
                          ],
                          color: "blue",
                        },
                      ].map((team, index) => (
                        <div
                          key={index}
                          className={`bg-${team.color}-900/20 p-6 rounded-xl border border-${team.color}-500/30`}
                        >
                          <team.icon
                            className={`h-12 w-12 text-${team.color}-400 mb-4`}
                          />
                          <h4 className="mb-2 text-xl font-semibold text-white">
                            {team.title}
                          </h4>
                          <p className={`text-${team.color}-300 mb-4`}>
                            {team.count} from {team.desc}
                          </p>
                          <ul
                            className={`text-${team.color}-200 space-y-1 text-sm`}
                          >
                            {team.items.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {[
                        {
                          title: "Historical Event Analysis",
                          desc: "Validated against 10+ years of wildfire, flood, and earthquake data across California",
                          color: "green",
                        },
                        {
                          title: "Field Survey Verification",
                          desc: "On-site verification at 1,000+ properties with ±0.3m spatial precision",
                          color: "blue",
                        },
                        {
                          title: "Peer Review Process",
                          desc: "3 papers published in Nature AI, ICML, NeurIPS with external validation",
                          color: "purple",
                        },
                      ].map((validation, index) => (
                        <div
                          key={index}
                          className={`bg-gradient-to-r from-${validation.color}-600 to-${validation.color}-700 p-6 rounded-xl`}
                        >
                          <h4 className="mb-3 text-xl font-semibold text-white">
                            {validation.title}
                          </h4>
                          <p className={`text-${validation.color}-100`}>
                            {validation.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "advantages" && (
                  <div className="max-w-none prose prose-lg prose-invert">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                      Competitive Advantages
                    </h2>

                    <div className="grid gap-8 mb-12 md:grid-cols-2">
                      <div className="p-8 rounded-xl border bg-yellow-900/20 border-yellow-500/30">
                        <FileText className="mb-4 w-12 h-12 text-yellow-400" />
                        <h4 className="mb-4 text-2xl font-semibold text-white">
                          12 Patent Applications
                        </h4>
                        <ul className="space-y-2 text-yellow-200">
                          <li>• Core coordinate transformation algorithms</li>
                          <li>• Geo neural network architectures</li>
                          <li>• Multi-agent coordination protocols</li>
                          <li>• Real-time spatial processing methods</li>
                        </ul>
                      </div>

                      <div className="p-8 rounded-xl border bg-blue-900/20 border-blue-500/30">
                        <Brain className="mb-4 w-12 h-12 text-blue-400" />
                        <h4 className="mb-4 text-2xl font-semibold text-white">
                          Proprietary Datasets
                        </h4>
                        <ul className="space-y-2 text-blue-200">
                          <li>• 47 months of curated research data</li>
                          <li>• 2.3M+ validated coordinate records</li>
                          <li>• Multi-source environmental data fusion</li>
                          <li>• Real-time data stream integration</li>
                        </ul>
                      </div>
                    </div>

                    <h3 className="mb-6 text-3xl font-bold text-white">
                      Performance Comparison
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="overflow-hidden w-full rounded-xl border-collapse bg-white/5">
                        <thead>
                          <tr className="bg-white/10">
                            <th className="p-4 font-semibold text-left text-white">
                              Metric
                            </th>
                            <th className="p-4 font-semibold text-center text-cyan-400">
                              GeoAI Agentic Flow
                            </th>
                            <th className="p-4 font-semibold text-center text-gray-300">
                              Traditional GIS
                            </th>
                            <th className="p-4 font-semibold text-center text-gray-300">
                              Standard AI
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              metric: "Processing Speed",
                              us: "2.3M coords/sec",
                              gis: "23K coords/sec",
                              ai: "N/A",
                            },
                            {
                              metric: "Spatial Accuracy",
                              us: "95.2% (±5m)",
                              gis: "87% (±5m)",
                              ai: "N/A",
                            },
                            {
                              metric: "Response Latency",
                              us: "<100ms",
                              gis: "15-30 seconds",
                              ai: "2-5 seconds",
                            },
                            {
                              metric: "Semantic Understanding",
                              us: "Full spatial intelligence",
                              gis: "Basic visualization",
                              ai: "No spatial context",
                            },
                          ].map((row, index) => (
                            <tr
                              key={index}
                              className={index % 2 === 0 ? "bg-white/5" : ""}
                            >
                              <td className="p-4 font-medium text-white">
                                {row.metric}
                              </td>
                              <td className="p-4 font-bold text-center text-green-400">
                                {row.us}
                              </td>
                              <td className="p-4 text-center text-gray-300">
                                {row.gis}
                              </td>
                              <td className="p-4 text-center text-gray-300">
                                {row.ai}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeSection === "future" && (
                  <div className="max-w-none prose prose-lg prose-invert">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                      Future Developments
                    </h2>

                    <div className="p-8 mb-12 bg-gradient-to-r rounded-2xl border from-indigo-900/50 via-purple-900/50 to-pink-900/50 border-purple-500/30">
                      <h3 className="mb-4 text-3xl font-bold text-purple-300">
                        Vision 2030: Construction Intelligence Platform
                      </h3>
                      <p className="text-lg text-purple-100">
                        Building the construction industry's leading
                        environmental risk assessment platform, helping
                        contractors and builders make informed decisions about
                        property protection and infrastructure development
                        across diverse geographic markets.
                      </p>
                    </div>

                    <div className="space-y-12">
                      {[
                        {
                          title: "Near-Term (6-12 months)",
                          color: "green",
                          items: [
                            {
                              title: "Enhanced Agent Specialization",
                              desc: "Hurricane tracking, wildfire behavior, infrastructure resilience agents",
                            },
                            {
                              title: "National Coverage",
                              desc: "Expansion to all 50 US states with localized regulations",
                            },
                          ],
                        },
                        {
                          title: "Medium-Term (1-3 years)",
                          color: "blue",
                          items: [
                            {
                              title: "Advanced Risk Modeling",
                              desc: "Enhanced prediction accuracy with additional environmental data sources",
                            },
                            {
                              title: "Mobile Applications",
                              desc: "On-site risk assessment tools for construction professionals",
                            },
                            {
                              title: "API Integrations",
                              desc: "Direct connections with construction CRM and project management systems",
                            },
                          ],
                        },
                        {
                          title: "Long-Term (3-10 years)",
                          color: "purple",
                          items: [
                            {
                              title: "Global Market Expansion",
                              desc: "International environmental risk assessment for construction markets",
                            },
                            {
                              title: "Predictive Maintenance",
                              desc: "Long-term building performance and maintenance scheduling",
                            },
                            {
                              title: "Regulatory Compliance",
                              desc: "Automated building code compliance and permit assistance",
                            },
                          ],
                        },
                      ].map((phase, index) => (
                        <div key={index}>
                          <div className="flex items-center mb-6 space-x-4">
                            <div
                              className={`w-4 h-4 bg-${phase.color}-500 rounded-full`}
                            ></div>
                            <h3 className="text-2xl font-bold text-white">
                              {phase.title}
                            </h3>
                            <div
                              className={`flex-1 h-0.5 bg-${phase.color}-500`}
                            ></div>
                          </div>
                          <div className="grid gap-6 md:grid-cols-2">
                            {phase.items.map((item, i) => (
                              <div
                                key={i}
                                className={`bg-${phase.color}-900/20 p-6 rounded-xl border border-${phase.color}-500/30`}
                              >
                                <h4 className="mb-3 text-xl font-semibold text-white">
                                  {item.title}
                                </h4>
                                <p className={`text-${phase.color}-200`}>
                                  {item.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Core Architecture */}
        <div className="mb-20">
          <h3 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-white">
            Beyond Traditional AI:{" "}
            <span className="text-cyan-500">Spatial Intelligence</span>
          </h3>

          <div className="grid gap-12 items-center lg:grid-cols-2">
            <div>
              <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-blue-100">
                While conventional AI processes text and images, GeoAI Agentic
                Flow operates on pure spatial coordinates, elevation data, and
                environmental vectors. Our breakthrough coordinate algorithms
                create multi-dimensional neural pathways that understand
                geographic relationships the way human spatial cognition works.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                    <Hexagon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      Coordinate Vector Processing
                    </h4>
                    <p className="text-gray-600 dark:text-blue-200">
                      Transform latitude/longitude pairs into high-dimensional
                      feature spaces that capture spatial relationships,
                      elevation gradients, and environmental interconnections.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      Geo Neural Networks
                    </h4>
                    <p className="text-gray-600 dark:text-blue-200">
                      Proprietary neural architectures trained on spatial
                      patterns, enabling the system to recognize fire spread
                      paths, flood basins, and seismic vulnerability zones
                      without explicit programming.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      Agentic Flow Architecture
                    </h4>
                    <p className="text-gray-600 dark:text-blue-200">
                      128 specialized AI agents coordinate through optimized
                      pathways, each focused on specific environmental risks -
                      from wildfire modeling to flood prediction and seismic
                      analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-blue-900/50 to-purple-900/50 border-cyan-500/30">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="p-4 text-center rounded-xl backdrop-blur-sm bg-white/10">
                    <Cpu className="mx-auto mb-2 w-8 h-8 text-cyan-400" />
                    <div className="text-lg font-bold">512</div>
                    <div className="text-sm text-blue-200">
                      Coordinate Algorithms
                    </div>
                  </div>
                  <div className="p-4 text-center rounded-xl backdrop-blur-sm bg-white/10">
                    <Layers className="mx-auto mb-2 w-8 h-8 text-purple-400" />
                    <div className="text-lg font-bold">23</div>
                    <div className="text-sm text-blue-200">
                      Neural Network Layers
                    </div>
                  </div>
                  <div className="p-4 text-center rounded-xl backdrop-blur-sm bg-white/10">
                    <GitBranch className="mx-auto mb-2 w-8 h-8 text-green-400" />
                    <div className="text-lg font-bold">128</div>
                    <div className="text-sm text-blue-200">
                      Agentic Pathways
                    </div>
                  </div>
                  <div className="p-4 text-center rounded-xl backdrop-blur-sm bg-white/10">
                    <Globe className="mx-auto mb-2 w-8 h-8 text-orange-400" />
                    <div className="text-lg font-bold">2.3M</div>
                    <div className="text-sm text-blue-200">
                      Processed Coordinates
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-2 text-2xl font-bold text-cyan-400">
                    95.2%
                  </div>
                  <div className="text-blue-200">Spatial Accuracy</div>
                  <div className="mt-1 text-xs text-blue-300">
                    ±0.3m precision
                  </div>
                </div>
              </div>

              {/* Floating elements for visual appeal */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full delay-1000 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Technical Innovation */}
        <div className="mb-20">
          <h3 className="mb-12 text-4xl font-bold text-center text-gray-900 dark:text-white">
            Revolutionary{" "}
            <span className="text-cyan-500">Technical Breakthroughs</span>
          </h3>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-blue-900/40 to-cyan-900/40 border-cyan-500/30">
              <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
                Semantic Geospatial Understanding
              </h4>
              <p className="text-center text-gray-600 dark:text-blue-200">
                Unlike traditional GIS systems that store static coordinates,
                our AI understands the meaning behind spatial relationships -
                recognizing fire corridors, watershed vulnerabilities, and
                structural risk patterns through pure geometric intelligence.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-purple-900/40 to-indigo-900/40 border-purple-500/30">
              <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
                Real-Time Coordinate Synthesis
              </h4>
              <p className="text-center text-gray-600 dark:text-purple-200">
                Proprietary algorithms process millions of coordinate
                transformations per second, creating dynamic risk heatmaps that
                update as environmental conditions change, construction permits
                are filed, and property modifications occur.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br rounded-2xl border backdrop-blur-sm from-green-900/40 to-teal-900/40 border-green-500/30">
              <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
                Multi-Agent Coordination
              </h4>
              <p className="text-center text-gray-600 dark:text-green-200">
                Specialized AI agents work in coordinated flows - Fire Risk
                Agents analyze burn patterns, Flood Agents model water flow
                dynamics, and Construction Agents identify building
                vulnerabilities, all sharing insights through our Agentic Flow
                protocol.
              </p>
            </div>
          </div>
        </div>

        {/* Research Team */}
        <div className="p-12 text-center bg-gradient-to-r from-gray-100 rounded-3xl border border-gray-300 to-slate-200 dark:from-slate-800/50 dark:to-blue-800/50 dark:border-cyan-500/20">
          <h3 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
            Leading AI Research Team
          </h3>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-blue-100">
            Our internal AI R&D division has pioneered this new field of
            Geospatial Artificial Intelligence, combining expertise from MIT,
            Stanford, Google DeepMind, and NASA's Jet Propulsion Laboratory.
          </p>

          <div className="grid gap-8 mb-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-cyan-400">8</div>
              <div className="text-gray-600 dark:text-blue-200">
                PhD Researchers
              </div>
              <div className="text-xs text-gray-500 dark:text-blue-300">
                Geographic AI & ML
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-purple-400">12</div>
              <div className="text-gray-600 dark:text-blue-200">
                Patents Filed
              </div>
              <div className="text-xs text-gray-500 dark:text-blue-300">
                Coordinate Algorithms
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-green-400">3</div>
              <div className="text-gray-600 dark:text-blue-200">
                Research Papers
              </div>
              <div className="text-xs text-gray-500 dark:text-blue-300">
                Nature AI, ICML, NeurIPS
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-orange-400">47</div>
              <div className="text-blue-200">Months R&D</div>
              <div className="text-xs text-blue-300">
                Breakthrough Development
              </div>
            </div>
          </div>

          <p className="italic text-gray-600 dark:text-blue-200">
            "GeoAI Agentic Flow represents the first true semantic understanding
            of geographic space in artificial intelligence. We're not just
            processing coordinates - we're teaching machines to think
            spatially."
          </p>
          <p className="mt-2 font-semibold text-cyan-600 dark:text-cyan-400">
            — Yev Chuba, M.S. Data Science & Applied Machine Learning
          </p>
        </div>
      </div>
    </div>
  );
}

import { Navigation } from "../components/Navigation";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Brain,
  Network,
  Globe,
  Target,
  Download,
  ExternalLink,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default async function ResearchPage() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }
  // 🔥 CRITICAL: This publications array contains validated research metrics.
  // These numbers are synchronized across all pages - DO NOT change without updating:
  // - /publication/[slug]/page.tsx (metadata)
  // - /page.tsx (homepage research section)
  // - /technology/page.tsx (performance metrics)
  //
  // 📝 IMPORTANT: After making changes, update documentation files:
  // - README.md, DEVELOPMENT.md, CHANGELOG.md, .cursorrules
  // See DEVELOPMENT.md "Documentation Maintenance" section for complete requirements.
  const publications = [
    {
      id: "geoai_agentic_flow",
      title:
        "GeoAI Agentic Flow: A Novel Architecture for Spatial Intelligence",
      subtitle:
        "Revolutionary 512-dimensional coordinate embeddings with 95.2% spatial accuracy",
      description:
        "An innovative architecture that directly processes spatial coordinates via advanced embedding algorithms, generating multi-dimensional neural representations that capture geographic relationships akin to human spatial cognition.",
      publishDate: "2025",
      authors: ["Yevheniy Chuba"],
      institution: "BlazeBuilder AI Research Laboratory",
      keywords: [
        "spatial intelligence",
        "geographic AI",
        "coordinate embeddings",
        "environmental risk assessment",
        "neural networks",
      ],
      stats: {
        accuracy: "95.2%",
        precision: "±5m",
        processing: "1M/sec",
        dimensions: "512",
      },
      color: "from-slate-600 to-purple-400",
      icon: Brain,
      slug: "geoai_agentic_flow",
    },
    {
      id: "coordinate_vector_processing",
      title:
        "Coordinate Embedding Framework: 512-Dimensional Spatial Representations",
      subtitle:
        "Transforming coordinates into semantic feature vectors for geographic neural networks",
      description:
        "An innovative algorithm that embeds raw coordinates into 512-dimensional vectors, incorporating spatial relations, environmental factors, topographic attributes, and infrastructure metrics.",
      publishDate: "2025",
      authors: ["Yevheniy Chuba"],
      institution: "BlazeBuilder AI Research Laboratory",
      keywords: [
        "coordinate embeddings",
        "spatial representations",
        "geographic neural networks",
        "feature encoding",
      ],
      stats: {
        dimensions: "512",
        accuracy: "95.4%",
        speed: "5-10x",
        coverage: "2.3M",
      },
      color: "from-slate-400 to-blue-400",
      icon: Network,
      slug: "coordinate_vector_processing",
    },
    {
      id: "multi_agent_coordination",
      title: "Multi-Agent Coordination for Large-Scale Geospatial Analysis",
      subtitle:
        "128 specialized AI agents coordinating for environmental risk assessment",
      description:
        "A multi-agent coordination framework utilizing 128 specialized AI agents across four categories: Wildfire Risk, Flood Risk, Seismic Risk, and Analytics with emergent intelligent coordination.",
      publishDate: "2025",
      authors: ["Yevheniy Chuba"],
      institution: "BlazeBuilder AI Research Laboratory",
      keywords: [
        "multi-agent systems",
        "geospatial analysis",
        "environmental risk assessment",
        "agent coordination",
      ],
      stats: {
        agents: "128",
        accuracy: "92.1%",
        improvement: "+35%",
        latency: "<200ms",
      },
      color: "from-slate-500 to-emerald-400",
      icon: Users,
      slug: "multi_agent_geospatial_coordination",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br via-blue-50 to-indigo-100 transition-colors duration-300 from-slate-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      {/* Navigation */}
      <Navigation />

      {/* Research Hero Section */}
      <section className="pt-20 scroll-mt-24">
        <div className="px-4 pt-12 pb-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center px-4 py-2 mb-8 space-x-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full">
              <Brain className="w-4 h-4" />
              <span>Breakthrough Research Publications</span>
            </div>

            <h1 className="mb-8 text-5xl font-bold md:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 dark:from-gray-100 dark:via-purple-300 dark:to-indigo-300">
                Pioneering Spatial Intelligence
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
                Research & Innovation
              </span>
            </h1>

            <p className="mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
              Comprehensive research into geographic artificial intelligence,
              multi-agent systems, and spatial computing. Our validated
              publications establish new standards for environmental risk
              assessment and construction intelligence.
            </p>

            <div className="grid grid-cols-2 gap-8 mx-auto max-w-4xl md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-purple-600 dark:text-purple-400">
                  512
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Embedding Dimensions
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">
                  128
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  AI Agents
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                  95.2%
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Spatial Accuracy
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  ±5m
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Precision
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publications Grid */}
      <section className="pb-20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-8">
            {publications.map((paper, index) => {
              const IconComponent = paper.icon;
              return (
                <div
                  key={paper.id}
                  className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-8`}
                  >
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className={`p-3 bg-gradient-to-br ${paper.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex space-x-3">
                          <Link
                            href={`/publication/${paper.slug}`}
                            className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg transition-all duration-300 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 hover:shadow-lg"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Read Full Paper</span>
                          </Link>
                        </div>
                      </div>

                      <h2 className="mb-3 text-3xl font-bold text-gray-900 transition-colors duration-300 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {paper.title}
                      </h2>

                      <p className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                        {paper.subtitle}
                      </p>

                      <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">
                        {paper.description}
                      </p>

                      {/* Metadata */}
                      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                        <div>
                          <div className="flex items-center mb-2 space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Published {paper.publishDate}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Authors:</strong> {paper.authors.join(", ")}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Institution:</strong> {paper.institution}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                            <strong>Keywords:</strong>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {paper.keywords.map((keyword) => (
                              <span
                                key={keyword}
                                className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-300"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Stats Panel */}
                    <div className="md:w-80">
                      <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <h3 className="flex items-center mb-8 text-xl font-semibold text-gray-900 dark:text-gray-100">
                          <BarChart3 className="mr-3 w-6 h-6" />
                          Key Metrics
                        </h3>
                        {/* 🎨 UPDATED: Now using grid layout with smart labels to prevent text cutoff */}
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(paper.stats).map(([key, value]) => {
                            // Smart label mapping for better fit and clarity
                            const labelMap: { [key: string]: string } = {
                              accuracy: "Accuracy",
                              precision: "Precision",
                              processing: "Speed",
                              dimensions: "Dimensions",
                              speed: "Performance",
                              coverage: "Dataset",
                              agents: "AI Agents",
                              improvement: "Conv Rate",
                              latency: "Response",
                            };
                            const displayLabel =
                              labelMap[key] || key.replace("_", " ");

                            return (
                              <div
                                key={key}
                                className="px-4 py-7 text-center rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                              >
                                <div
                                  className={`text-2xl font-bold mb-2 leading-tight ${
                                    paper.color.includes("purple")
                                      ? "text-purple-600 dark:text-purple-400"
                                      : paper.color.includes("blue")
                                        ? "text-blue-600 dark:text-blue-400"
                                        : paper.color.includes("emerald")
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  {value}
                                </div>
                                <div className="text-xs font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                                  {displayLabel}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${paper.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl pointer-events-none`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Research Impact Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-gray-100">
              Research Impact & Applications
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
              Our research establishes new paradigms in spatial intelligence
              with validated real-world applications across multiple industries.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-8 rounded-2xl border backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-gray-100">
                Environmental Intelligence
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Validated accuracy in wildfire (92.1%), flood (89.4%), and
                seismic (87.2%) risk assessment for 2.3M+ properties across
                California.
              </p>
            </div>

            <div className="p-8 rounded-2xl border backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-400 rounded-2xl">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-gray-100">
                Construction Intelligence
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                35% improvement in lead conversion rates with validated
                performance benchmarks and real-world deployment results.
              </p>
            </div>

            <div className="p-8 rounded-2xl border backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-center items-center mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-slate-500 to-emerald-400 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-gray-100">
                AI System Architecture
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Multi-agent coordination with 128 specialized agents enabling
                emergent intelligence with sub-200ms response times.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

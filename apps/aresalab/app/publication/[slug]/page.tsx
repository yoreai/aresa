import { Navigation } from "../../components/Navigation";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { promises as fs } from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import {
  Brain,
  Network,
  Users,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

// Publication metadata
const publications = {
  geoai_agentic_flow: {
    title:
      "GeoAI Agentic Flow: A Novel Architecture for Spatial Intelligence in Environmental Risk Assessment",
    file: "paper_1_geoai_agentic_flow.md",
    pdfFile: "geoai_agentic_flow.pdf",
    icon: Brain,
    color: "from-slate-600 to-purple-400",
    stats: {
      accuracy: "95.2%",
      precision: "±5m",
      processing: "1M/sec",
      dimensions: "512",
    },
  },
  coordinate_vector_processing: {
    title:
      "Coordinate Embedding Framework: 512-Dimensional Spatial Representations for Geographic Neural Networks",
    file: "paper_2_coordinate_vector_processing.md",
    pdfFile: "coordinate_vector_processing.pdf",
    icon: Network,
    color: "from-slate-400 to-blue-400",
    stats: {
      dimensions: "512",
      accuracy: "95.4%",
      speed: "5-10x",
      coverage: "2.3M",
    },
  },
  multi_agent_geospatial_coordination: {
    title:
      "Multi-Agent Coordination for Large-Scale Geospatial Analysis: A Case Study in California Fire Risk Assessment",
    file: "paper_3_multi_agent_geospatial_coordination.md",
    pdfFile: "multi_agent_geospatial_coordination.pdf",
    icon: Users,
    color: "from-slate-500 to-emerald-400",
    stats: {
      agents: "128",
      accuracy: "92.1%",
      improvement: "+35%",
      latency: "<200ms",
    },
  },
};

async function getPublicationContent(slug: string) {
  const publication = publications[slug as keyof typeof publications];
  if (!publication) {
    return null;
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "research_papers",
      publication.file
    );
    const content = await fs.readFile(filePath, "utf8");
    return { ...publication, content };
  } catch (error) {
    return null;
  }
}

// Generate static params for all publications
export async function generateStaticParams() {
  return Object.keys(publications).map((slug) => ({
    slug,
  }));
}

export default async function PublicationPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  const publicationData = await getPublicationContent(params.slug);

  if (!publicationData) {
    notFound();
  }

  const IconComponent = publicationData.icon;

  // Professional markdown components for academic papers
  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4">
        {children}
      </h4>
    ),
    p: ({ children }: any) => (
      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="mb-2 text-gray-700 dark:text-gray-300">{children}</li>
    ),
    code: ({ inline, children }: any) =>
      inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
            {children}
          </code>
        </pre>
      ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
        {children}
      </td>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <section className="pt-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="mb-8">
            <Link
              href="/research"
              className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Research</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-8 lg:p-12">
                <div className="flex items-start justify-between mb-8">
                  <div
                    className={`p-4 bg-gradient-to-br ${publicationData.color} rounded-2xl shadow-lg`}
                  >
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <div className="flex space-x-3">
                    <a
                      href={`/research/${publicationData.pdfFile}`}
                      download={publicationData.pdfFile}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-700 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>

                {/* Publication Content */}
                <div className="prose prose-lg max-w-none prose-gray dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                    components={markdownComponents}
                  >
                    {publicationData.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-80">
              <div className="sticky top-24 space-y-6">
                {/* Key Metrics */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
                    <BarChart3 className="h-6 w-6 mr-3" />
                    Key Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(publicationData.stats).map(
                      ([key, value]) => {
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
                          labelMap[key] || key.replace(/[_]/g, " ");

                        return (
                          <div
                            key={key}
                            className="bg-white dark:bg-gray-800 rounded-xl px-4 py-7 text-center border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                          >
                            <div
                              className={`text-2xl font-bold mb-2 leading-tight ${
                                publicationData.color.includes("purple")
                                  ? "text-purple-600 dark:text-purple-400"
                                  : publicationData.color.includes("blue")
                                    ? "text-blue-600 dark:text-blue-400"
                                    : publicationData.color.includes("emerald")
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-gray-900 dark:text-gray-100"
                              }`}
                            >
                              {value}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                              {displayLabel}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Publication Info */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Publication Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Published 2025
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300">
                        BlazeBuilder AI Research Laboratory
                      </span>
                    </div>
                  </div>
                </div>

                {/* Other Publications */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Related Publications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(publications)
                      .filter(([slug]) => slug !== params.slug)
                      .map(([slug, pub]) => {
                        const PubIcon = pub.icon;
                        return (
                          <Link
                            key={slug}
                            href={`/publication/${slug}`}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div
                              className={`p-2 bg-gradient-to-br ${pub.color} rounded-lg`}
                            >
                              <PubIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                                {pub.title.split(":")[0]}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

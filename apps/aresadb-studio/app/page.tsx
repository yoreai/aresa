'use client'

import { motion } from 'framer-motion'
import {
  Database,
  Zap,
  Search,
  GitBranch,
  Clock,
  HardDrive,
  Activity,
  FileText,
  Heart,
  Pill,
  Stethoscope,
  TrendingUp,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentQueries } from '@/components/dashboard/RecentQueries'
import { DatasetCard } from '@/components/dashboard/DatasetCard'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { QuickActions } from '@/components/dashboard/QuickActions'

const stats = [
  {
    label: 'Total Nodes',
    value: '287,493',
    change: '+12.5%',
    trend: 'up' as const,
    icon: Database,
  },
  {
    label: 'Total Edges',
    value: '1.2M',
    change: '+8.3%',
    trend: 'up' as const,
    icon: GitBranch,
  },
  {
    label: 'Avg Query Time',
    value: '0.42ms',
    change: '-23%',
    trend: 'up' as const,
    icon: Zap,
  },
  {
    label: 'Vector Searches',
    value: '45,291',
    change: '+156%',
    trend: 'up' as const,
    icon: Search,
  },
]

const datasets = [
  {
    name: 'Medical Transcriptions',
    description: 'Clinical notes and medical reports for NLP analysis',
    nodes: 4999,
    edges: 12847,
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    tags: ['RAG', 'NLP', 'Healthcare'],
  },
  {
    name: 'Drug Reviews',
    description: 'Patient reviews of medications with conditions and ratings',
    nodes: 215063,
    edges: 892341,
    icon: Pill,
    color: 'from-purple-500 to-pink-500',
    tags: ['Sentiment', 'Graph', 'Large'],
  },
  {
    name: 'Heart Disease UCI',
    description: 'Classic ML dataset for cardiovascular disease prediction',
    nodes: 303,
    edges: 1515,
    icon: Heart,
    color: 'from-red-500 to-orange-500',
    tags: ['Classification', 'Tabular'],
  },
  {
    name: 'PubMed Abstracts',
    description: 'Research paper abstracts for semantic search',
    nodes: 67238,
    edges: 234891,
    icon: Stethoscope,
    color: 'from-emerald-500 to-teal-500',
    tags: ['Vector', 'Research', 'RAG'],
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen gradient-mesh noise">
      {/* Header */}
      <header className="border-b border-border bg-background/50 glass sticky top-0 z-10">
        <div className="px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AresaDB Studio
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              High-performance multi-model database for healthcare ML research
            </p>
          </motion.div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Query Performance</h2>
                  <p className="text-sm text-muted-foreground">
                    Response times over the last 24 hours
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">23% faster</span>
                </div>
              </div>
              <PerformanceChart />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <QuickActions />
          </motion.div>
        </div>

        {/* Datasets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Healthcare ML Datasets</h2>
              <p className="text-sm text-muted-foreground">
                Pre-loaded datasets demonstrating AresaDB capabilities
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {datasets.map((dataset, index) => (
              <motion.div
                key={dataset.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <DatasetCard {...dataset} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Queries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <RecentQueries />
        </motion.div>
      </div>
    </div>
  )
}


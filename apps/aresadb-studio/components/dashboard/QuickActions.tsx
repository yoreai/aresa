'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Terminal,
  Search,
  Upload,
  Download,
  Sparkles,
  FileText,
} from 'lucide-react'

const actions = [
  {
    name: 'Run SQL Query',
    description: 'Execute SQL against your data',
    href: '/query',
    icon: Terminal,
    color: 'bg-primary/10 text-primary',
  },
  {
    name: 'Vector Search',
    description: 'Semantic similarity search',
    href: '/vectors',
    icon: Sparkles,
    color: 'bg-accent/10 text-accent',
  },
  {
    name: 'RAG Pipeline',
    description: 'Query documents with AI',
    href: '/rag',
    icon: FileText,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    name: 'Import Data',
    description: 'Load CSV, JSON, or Parquet',
    href: '/playground?action=import',
    icon: Upload,
    color: 'bg-orange-500/10 text-orange-500',
  },
]

export function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer">
                <div className={`p-2.5 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {action.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


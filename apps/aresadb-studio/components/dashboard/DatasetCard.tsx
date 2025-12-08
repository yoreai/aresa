'use client'

import Link from 'next/link'
import { LucideIcon, ArrowRight, Database, GitBranch } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface DatasetCardProps {
  name: string
  description: string
  nodes: number
  edges: number
  icon: LucideIcon
  color: string
  tags: string[]
}

export function DatasetCard({
  name,
  description,
  nodes,
  edges,
  icon: Icon,
  color,
  tags,
}: DatasetCardProps) {
  return (
    <Link href={`/query?dataset=${encodeURIComponent(name)}`}>
      <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg truncate">{name}</h3>
              <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-secondary text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">
                  {formatNumber(nodes)} nodes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono">
                  {formatNumber(edges)} edges
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}


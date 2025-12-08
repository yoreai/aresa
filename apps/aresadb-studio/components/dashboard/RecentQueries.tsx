'use client'

import { Clock, Terminal, Sparkles, GitBranch, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const recentQueries = [
  {
    query: "SELECT * FROM drug_reviews WHERE condition = 'Diabetes' ORDER BY rating DESC LIMIT 10",
    type: 'sql' as const,
    duration: '0.34ms',
    rows: 10,
    status: 'success' as const,
    time: '2 min ago',
  },
  {
    query: "VECTOR SEARCH 'cardiac arrhythmia treatment options' FROM medical_transcriptions LIMIT 5",
    type: 'vector' as const,
    duration: '1.23ms',
    rows: 5,
    status: 'success' as const,
    time: '5 min ago',
  },
  {
    query: "SELECT p.name, COUNT(r.id) as review_count FROM patients p JOIN drug_reviews r ON p.id = r.patient_id GROUP BY p.name",
    type: 'sql' as const,
    duration: '2.45ms',
    rows: 1247,
    status: 'success' as const,
    time: '12 min ago',
  },
  {
    query: "TRAVERSE FROM node:patient_001 VIA 'prescribed' TO 'drug' DEPTH 2",
    type: 'graph' as const,
    duration: '0.89ms',
    rows: 23,
    status: 'success' as const,
    time: '18 min ago',
  },
  {
    query: "VECTOR SEARCH 'symptoms of heart failure with preserved ejection fraction' FROM pubmed_abstracts",
    type: 'vector' as const,
    duration: '1.56ms',
    rows: 10,
    status: 'success' as const,
    time: '24 min ago',
  },
]

const typeConfig = {
  sql: { icon: Terminal, color: 'text-primary bg-primary/10' },
  vector: { icon: Sparkles, color: 'text-accent bg-accent/10' },
  graph: { icon: GitBranch, color: 'text-emerald-500 bg-emerald-500/10' },
}

export function RecentQueries() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Recent Queries</h2>
          <p className="text-sm text-muted-foreground">
            Your latest database operations
          </p>
        </div>
        <button className="text-sm text-primary hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {recentQueries.map((item, index) => {
          const config = typeConfig[item.type]
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer group"
            >
              <div className={cn('p-2 rounded-lg shrink-0', config.color)}>
                <config.icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {item.type}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
                <p className="font-mono text-sm truncate group-hover:text-primary transition-colors">
                  {item.query}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {item.duration}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.rows} rows
                  </span>
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" />
                    Success
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
}

export function StatsCard({ label, value, change, trend, icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend === 'up' ? 'text-emerald-500' : 'text-red-500'
          )}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {change}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-secondary/50 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  )
}


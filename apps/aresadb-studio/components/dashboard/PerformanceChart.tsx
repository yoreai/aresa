'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { time: '00:00', sql: 0.45, vector: 1.2, graph: 0.8 },
  { time: '02:00', sql: 0.42, vector: 1.1, graph: 0.75 },
  { time: '04:00', sql: 0.38, vector: 0.95, graph: 0.7 },
  { time: '06:00', sql: 0.52, vector: 1.4, graph: 0.9 },
  { time: '08:00', sql: 0.65, vector: 1.8, graph: 1.1 },
  { time: '10:00', sql: 0.58, vector: 1.5, graph: 0.95 },
  { time: '12:00', sql: 0.48, vector: 1.3, graph: 0.85 },
  { time: '14:00', sql: 0.55, vector: 1.45, graph: 0.92 },
  { time: '16:00', sql: 0.62, vector: 1.6, graph: 1.0 },
  { time: '18:00', sql: 0.45, vector: 1.2, graph: 0.78 },
  { time: '20:00', sql: 0.4, vector: 1.05, graph: 0.72 },
  { time: '22:00', sql: 0.38, vector: 0.98, graph: 0.68 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-4 shadow-xl">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-mono font-medium">{entry.value}ms</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function PerformanceChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sqlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vectorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 18%)" />
          <XAxis
            dataKey="time"
            stroke="hsl(240 5% 65%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(240 5% 65%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}ms`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sql"
            name="SQL"
            stroke="#6366f1"
            fill="url(#sqlGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="vector"
            name="Vector"
            stroke="#8b5cf6"
            fill="url(#vectorGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="graph"
            name="Graph"
            stroke="#10b981"
            fill="url(#graphGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">SQL Queries</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Vector Search</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Graph Traversal</span>
        </div>
      </div>
    </div>
  )
}


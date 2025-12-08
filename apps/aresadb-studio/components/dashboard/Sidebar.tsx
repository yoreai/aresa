'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Terminal,
  Sparkles,
  FileText,
  Beaker,
  BarChart3,
  Settings,
  Database,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Query', href: '/query', icon: Terminal },
  { name: 'Vectors', href: '/vectors', icon: Sparkles },
  { name: 'RAG', href: '/rag', icon: FileText },
  { name: 'Playground', href: '/playground', icon: Beaker },
  { name: 'Benchmarks', href: '/benchmarks', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-xl gradient-primary"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: 'blur(8px)', zIndex: -1 }}
            />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AresaDB
            </h1>
            <p className="text-xs text-muted-foreground">Studio</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'gradient-primary text-white glow-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl gradient-primary -z-10"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Database Status */}
      <div className="p-4 border-t border-border">
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Connected</span>
            </div>
            <Database className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">demo_database</p>
            <p className="text-xs text-muted-foreground font-mono">
              25,847 nodes • 12,493 edges
            </p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}


// ARESA Studio - Query History

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Search, BarChart, Play, Copy, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, HistoryEntry } from '@/lib/api';
import { LoadingSpinner, LoadingSkeleton } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { StatCard } from '@/components/StatCard';
import { toast } from 'sonner';
import { setSelectedConnection } from '@/lib/connection-state';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRerun = (entry: HistoryEntry) => {
    // Save the query to sessionStorage for the query page to pick up
    sessionStorage.setItem('rerun-query', entry.query);
    // Set the connection
    setSelectedConnection(entry.source);
    // Navigate to query page
    router.push('/query');
    toast.success(`Loading query for ${entry.source}...`);
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const entries = await api.getHistory(100);
      setHistory(entries);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchHistory = async () => {
    if (!searchTerm.trim()) {
      loadHistory();
      return;
    }

    setLoading(true);
    try {
      const entries = await api.searchHistory(searchTerm);
      setHistory(entries);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history;

  const stats = {
    total: history.length,
    successful: history.filter(h => h.success).length,
    avgDuration: history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + (h.durationMs || 0), 0) / history.length)
      : 0,
    uniqueSources: new Set(history.map(h => h.source)).size,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Top Bar */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ARESA Studio
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">Query History</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Queries"
            value={stats.total}
            icon={History}
            color="cyan"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}%`}
            icon={BarChart}
            color="green"
          />
          <StatCard
            title="Avg Duration"
            value={`${stats.avgDuration}ms`}
            icon={BarChart}
            color="blue"
          />
          <StatCard
            title="Sources Used"
            value={stats.uniqueSources}
            icon={Database}
            color="purple"
          />
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchHistory()}
                placeholder="Search queries..."
                className="w-full bg-slate-800 border border-slate-600 rounded pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={searchHistory}
              className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold flex items-center gap-2">
              <History className="text-blue-400" size={20} />
              Query History ({filteredHistory.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-700">
            {loading ? (
              <div className="p-8">
                <LoadingSkeleton />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={History}
                  title="No query history"
                  description="Run some queries to see them appear here"
                  actionLabel="Try Query Editor"
                  actionHref="/query"
                />
              </div>
            ) : (
              filteredHistory.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {entry.success ? (
                        <span className="text-green-400 font-bold">✓</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗</span>
                      )}
                      <div>
                        <p className="text-sm text-slate-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-cyan-400 font-medium mt-1">{entry.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(entry.query);
                          toast.success('Query copied to clipboard');
                        }}
                        className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleRerun(entry)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        <Play size={14} />
                        Re-run
                      </button>
                    </div>
                  </div>

                  <div className="ml-8">
                    <pre className="text-sm font-mono text-slate-300 bg-slate-900/50 p-3 rounded overflow-x-auto">
                      {entry.query}
                    </pre>

                    <div className="flex items-center gap-6 mt-2 text-xs text-slate-500">
                      {entry.durationMs && <span>⏱ {entry.durationMs}ms</span>}
                      {entry.rowsReturned !== undefined && <span>📊 {entry.rowsReturned} rows</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


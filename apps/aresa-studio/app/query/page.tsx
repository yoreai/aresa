// ARESA Studio - SQL Query Editor

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Play, Save, Download, Clock } from 'lucide-react';
import { api, Connection, QueryResult } from '@/lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResultsTable } from '@/components/ResultsTable';
import { getSelectedConnection, setSelectedConnection } from '@/lib/connection-state';

// Dynamic import to avoid SSR issues with Monaco
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function QueryPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [query, setQuery] = useState('SELECT * FROM table_name LIMIT 10;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    loadConnections();

    // Check if there's a re-run query from history page
    const rerunQuery = sessionStorage.getItem('rerun-query');
    if (rerunQuery) {
      setQuery(rerunQuery);
      sessionStorage.removeItem('rerun-query'); // Clear it after use
    }
  }, []);

  const loadConnections = async () => {
    try {
      const conns = await api.listConnections();
      setConnections(conns);
      if (conns.length > 0 && !selectedSource) {
        // Use stored connection if available and valid, otherwise use first
        const stored = getSelectedConnection();
        const validConnection = stored && conns.some(c => c.name === stored);
        setSelectedSource(validConnection ? stored : conns[0].name);
      }
    } catch (err) {
      console.error('Failed to load connections:', err);
    }
  };

  const executeQuery = async () => {
    if (!selectedSource || !query.trim()) {
      toast.error('Please select a source and enter a query');
      return;
    }

    setExecuting(true);
    setError(null);
    setResult(null);

    const toastId = toast.loading('Executing query...');

    try {
      const result = await api.executeQuery(selectedSource, query);
      setResult(result);
      toast.success(`Query completed: ${result.rowCount} rows in ${result.executionTimeMs}ms`, { id: toastId });
    } catch (err: any) {
      const errorMsg = err.message || 'Query failed';
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setExecuting(false);
    }
  };

  const exportCSV = () => {
    if (!result) return;

    const csv = [
      result.columns.join(','),
      ...result.rows.map(row =>
        result.columns.map(col => `"${row[col] || ''}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-results.csv';
    a.click();
    toast.success('Exported to CSV');
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
            <span className="text-slate-300">Query Editor</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Source Selector */}
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                setSelectedConnection(e.target.value);
              }}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select database...</option>
              {connections.map((conn) => (
                <option key={conn.name} value={conn.name}>
                  {conn.name} ({conn.type})
                </option>
              ))}
            </select>

            <button
              onClick={executeQuery}
              disabled={executing || !selectedSource}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 px-4 py-2 rounded font-medium transition-all"
            >
              <Play size={16} />
              {executing ? 'Running...' : 'Run Query'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 overflow-hidden">
          <div className="border-b border-slate-700 p-2 bg-slate-900/50 flex items-center justify-between">
            <span className="text-sm text-slate-400 px-2">SQL Editor</span>
            <button className="text-slate-400 hover:text-white px-2 py-1 text-sm">
              <Save size={16} className="inline mr-1" />
              Save Query
            </button>
          </div>

          <div className="h-64">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={query}
              onChange={(value) => setQuery(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <ResultsTable
              columns={result.columns}
              rows={result.rows}
              executionTimeMs={result.executionTimeMs}
            />
          </div>
        )}
      </div>
    </div>
  );
}


// ARESA Studio - Connections Management

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Plus, Trash2, TestTube, CheckCircle, XCircle, Server, Cloud, HardDrive } from 'lucide-react';
import { api, Connection } from '@/lib/api';
import { toast } from 'sonner';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgres',
    uri: '',
    project: '',
    host: '',
    database: '',
  });

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    const conns = await api.listConnections();
    setConnections(conns);
  };

  const testConnection = async (name: string) => {
    const toastId = toast.loading(`Testing ${name}...`);
    try {
      const result = await api.pingConnection(name);
      toast.success(`✓ Connected in ${result.latencyMs}ms`, { id: toastId });
    } catch (err: any) {
      toast.error(`✗ Connection failed: ${err.message}`, { id: toastId });
    }
  };

  const deleteConnection = async (name: string) => {
    if (!confirm(`Delete connection "${name}"?`)) return;

    const toastId = toast.loading('Deleting connection...');
    try {
      await api.removeConnection(name);
      await loadConnections();
      toast.success('Connection deleted', { id: toastId });
    } catch (err) {
      toast.error('Failed to delete connection', { id: toastId });
    }
  };

  const addConnection = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Adding connection...');
    try {
      await api.addConnection({
        name: formData.name,
        type: formData.type,
        config: {
          uri: formData.uri,
          project: formData.project,
          host: formData.host,
          database: formData.database,
        },
      });

      setShowAddForm(false);
      setFormData({ name: '', type: 'postgres', uri: '', project: '', host: '', database: '' });
      await loadConnections();
      toast.success('Connection added successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to add connection: ${err.message}`, { id: toastId });
    }
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
            <span className="text-slate-300">Connections</span>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded font-medium transition-colors"
          >
            <Plus size={16} />
            Add Connection
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Add Connection Form */}
        {showAddForm && (
          <div className="mb-6 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <h3 className="font-semibold mb-4">Add New Connection</h3>

            <form onSubmit={addConnection} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Connection Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Database Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="bigquery">BigQuery</option>
                    <option value="clickhouse">ClickHouse</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>
              </div>

              {['postgres', 'mysql', 'sqlite'].includes(formData.type) && (
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Connection URI</label>
                  <input
                    type="text"
                    value={formData.uri}
                    onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
                    placeholder="postgres://user:pass@host:5432/db"
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2"
                  />
                </div>
              )}

              {formData.type === 'bigquery' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Project ID</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded font-medium"
                >
                  Add Connection
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connections List */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold flex items-center gap-2">
              <Database className="text-cyan-400" size={20} />
              Configured Connections ({connections.length})
            </h2>
          </div>

          <div className="grid gap-4 p-4">
            {connections.map((conn) => {
              // Parse connection details to extract relevant info
              const getConnectionInfo = () => {
                const details = conn.details || '';

                // Extract project for BigQuery
                const projectMatch = details.match(/project:\s*Some\("([^"]+)"\)/);
                const project = projectMatch ? projectMatch[1] : null;

                // Extract URI/host info
                const uriMatch = details.match(/uri:\s*Some\("([^"]+)"\)/);
                const hostMatch = details.match(/host:\s*Some\("([^"]+)"\)/);
                const uri = uriMatch ? uriMatch[1] : null;
                const host = hostMatch ? hostMatch[1] : null;

                // Extract database
                const dbMatch = details.match(/database:\s*Some\("([^"]+)"\)/);
                const database = dbMatch ? dbMatch[1] : null;

                return { project, uri, host, database };
              };

              const info = getConnectionInfo();

              // Get icon based on type
              const getIcon = () => {
                switch (conn.type) {
                  case 'bigquery':
                    return <Cloud className="text-blue-400" size={24} />;
                  case 'postgres':
                  case 'mysql':
                    return <Server className="text-green-400" size={24} />;
                  case 'sqlite':
                  case 'duckdb':
                    return <HardDrive className="text-orange-400" size={24} />;
                  default:
                    return <Database className="text-cyan-400" size={24} />;
                }
              };

              // Get type badge color
              const getTypeBadgeColor = () => {
                switch (conn.type) {
                  case 'bigquery':
                    return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
                  case 'postgres':
                    return 'bg-green-600/20 text-green-400 border-green-600/30';
                  case 'mysql':
                    return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
                  case 'clickhouse':
                    return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
                  default:
                    return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
                }
              };

              return (
                <div
                  key={conn.name}
                  className="bg-slate-900/50 rounded-lg border border-slate-700 p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-800 rounded-lg">
                        {getIcon()}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{conn.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded border ${getTypeBadgeColor()}`}>
                            {conn.type.toUpperCase()}
                          </span>
                        </div>

                        {/* Connection details - clean format */}
                        <div className="space-y-1 text-sm">
                          {conn.type === 'bigquery' && info.project && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-slate-500">Project:</span>
                              <span className="font-mono text-cyan-400">{info.project}</span>
                            </div>
                          )}
                          {info.host && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-slate-500">Host:</span>
                              <span className="font-mono">{info.host}</span>
                            </div>
                          )}
                          {info.database && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-slate-500">Database:</span>
                              <span className="font-mono">{info.database}</span>
                            </div>
                          )}
                          {info.uri && !info.host && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <span className="text-slate-500">URI:</span>
                              <span className="font-mono text-xs truncate max-w-md">{info.uri}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testConnection(conn.name)}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        <TestTube size={14} />
                        Test
                      </button>
                      <button
                        onClick={() => deleteConnection(conn.name)}
                        className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors border border-red-600/30"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


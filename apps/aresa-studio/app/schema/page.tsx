// ARESA Studio - Schema Explorer

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Database, Table, Columns, ChevronRight, Search, X, Filter } from 'lucide-react';
import { api, Connection, SchemaTable, SchemaColumn } from '@/lib/api';
import { LoadingSpinner, LoadingSkeleton } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { getSelectedConnection, setSelectedConnection } from '@/lib/connection-state';

export default function SchemaPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<SchemaColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'table' | 'view'>('all');

  // Filter tables based on search query and type filter
  const filteredTables = useMemo(() => {
    return tables.filter(table => {
      // Type filter
      const tableType = (table.type || '').toUpperCase();
      const isView = tableType === 'VIEW';
      const isTable = tableType === 'BASE TABLE' || tableType === 'TABLE' || !isView;

      if (filterType === 'view' && !isView) return false;
      if (filterType === 'table' && isView) return false;

      // Search filter
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const matchesName = table.name.toLowerCase().includes(query);
      const matchesSchema = table.schema?.toLowerCase().includes(query);
      return matchesName || matchesSchema;
    });
  }, [tables, searchQuery, filterType]);

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    if (selectedSource) {
      // Set loading FIRST to prevent stale data from showing
      setLoading(true);

      // Clear old state when source changes
      setTables([]);
      setSelectedTable('');
      setColumns([]);
      setSearchQuery('');
      setFilterType('all');

      // Load tables for new source
      const fetchTables = async () => {
        try {
          const tbls = await api.listTables(selectedSource);
          setTables(tbls);
        } catch (err: any) {
          console.error('Failed to load tables:', err);
          toast.error(`Failed to load tables: ${err.message}`);
          setTables([]); // Ensure tables is cleared on error
        } finally {
          setLoading(false);
        }
      };
      fetchTables();
    }
  }, [selectedSource]);

  useEffect(() => {
    if (selectedTable && selectedSource) {
      // Clear old columns before loading new ones
      setColumns([]);
      loadColumns();
    }
  }, [selectedTable, selectedSource]);

  const loadConnections = async () => {
    const conns = await api.listConnections();
    setConnections(conns);
    if (conns.length > 0) {
      // Use stored connection if available and valid, otherwise use first
      const stored = getSelectedConnection();
      const validConnection = stored && conns.some(c => c.name === stored);
      setSelectedSource(validConnection ? stored : conns[0].name);
    }
  };

  const loadColumns = async () => {
    setLoading(true);
    try {
      const cols = await api.getTableSchema(selectedSource, selectedTable);
      setColumns(cols);
      toast.success(`Loaded schema for ${selectedTable}`);
    } catch (err: any) {
      console.error('Failed to load columns:', err);
      toast.error(`Failed to load schema: ${err.message}`);
    } finally {
      setLoading(false);
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
            <span className="text-slate-300">Schema Explorer</span>
          </div>

          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setSelectedConnection(e.target.value);
            }}
            className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
          >
            {connections.map((conn) => (
              <option key={conn.name} value={conn.name}>
                {conn.name} ({conn.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Tables List */}
          <div className="col-span-4 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Table className="text-cyan-400" size={20} />
              Tables ({filteredTables.length}{filteredTables.length !== tables.length ? ` / ${tables.length}` : ''})
            </h3>

            {/* Search and Filter */}
            <div className="mb-4 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                  placeholder="Search tables..."
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-10 py-2 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="flex gap-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                    filterType === 'all'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('table')}
                  className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                    filterType === 'table'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Tables
                </button>
                <button
                  onClick={() => setFilterType('view')}
                  className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                    filterType === 'view'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  Views
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-4">
                  <LoadingSkeleton />
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={searchQuery ? Search : Table}
                    title={searchQuery ? "No matches found" : "No tables found"}
                    description={searchQuery
                      ? `No tables matching "${searchQuery}"${filterType !== 'all' ? ` (${filterType}s only)` : ''}`
                      : "This database appears to be empty or schema access is not configured."
                    }
                  />
                </div>
              ) : (
                filteredTables.map((table) => {
                  // Construct full table identifier: schema.table (for BigQuery/Postgres)
                  const fullTableId = table.schema ? `${table.schema}.${table.name}` : table.name;
                  return (
                    <button
                      key={fullTableId}
                      onClick={() => setSelectedTable(fullTableId)}
                      className={`w-full text-left p-3 rounded transition-colors ${
                        selectedTable === fullTableId
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate" title={table.name}>{table.name}</span>
                        {(table.type === 'view' || table.type === 'VIEW') && (
                          <span className="text-xs bg-purple-600 px-2 py-1 rounded flex-shrink-0 ml-2">VIEW</span>
                        )}
                      </div>
                      {table.schema && (
                        <span className="text-xs text-slate-500 truncate block" title={table.schema}>{table.schema}</span>
                      )}
                      {table.rowCount && (
                        <span className="text-xs text-slate-400">{table.rowCount.toLocaleString()} rows</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Columns */}
          <div className="col-span-8 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-4">
            {selectedTable ? (
              <>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Columns className="text-blue-400" size={20} />
                  {selectedTable}
                </h3>

                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-300">Column</th>
                        <th className="px-4 py-3 text-left text-slate-300">Type</th>
                        <th className="px-4 py-3 text-left text-slate-300">Nullable</th>
                        <th className="px-4 py-3 text-left text-slate-300">Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columns.map((col) => (
                        <tr key={col.name} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-mono text-cyan-300">{col.name}</td>
                          <td className="px-4 py-3 text-slate-400">{col.dataType}</td>
                          <td className="px-4 py-3">
                            {col.nullable ? (
                              <span className="text-slate-500">NULL</span>
                            ) : (
                              <span className="text-orange-400">NOT NULL</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {col.primaryKey && (
                              <span className="text-xs bg-yellow-600 px-2 py-1 rounded">PK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="text-center">
                  <Database className="mx-auto mb-3" size={48} />
                  <p>Select a table to view its schema</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


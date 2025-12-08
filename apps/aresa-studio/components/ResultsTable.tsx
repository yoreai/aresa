'use client';

import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ResultsTableProps {
  columns: string[];
  rows: Record<string, string>[];
  executionTimeMs: number;
}

export function ResultsTable({ columns, rows, executionTimeMs }: ResultsTableProps) {
  const exportCSV = () => {
    const csv = [
      columns.join(','),
      ...rows.map(row =>
        columns.map(col => `"${row[col] || ''}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const exportJSON = () => {
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to JSON');
  };

  const copyToClipboard = () => {
    const text = rows.map(row =>
      columns.map(col => row[col] || '').join('\t')
    ).join('\n');

    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-700 p-4 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 font-medium">
            {rows.length.toLocaleString()} rows
          </span>
          <span className="text-sm text-slate-500">
            {executionTimeMs}ms
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            <Copy size={14} />
            Copy
          </button>
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            <Download size={14} />
            JSON
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
          >
            <Download size={14} />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/70 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-slate-300 font-semibold border-b border-slate-700 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-slate-300 font-mono text-xs whitespace-nowrap">
                    {row[col] !== undefined && row[col] !== null && row[col] !== '' ? (
                      row[col]
                    ) : (
                      <span className="text-slate-600 italic">NULL</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {rows.length > 50 && (
        <div className="border-t border-slate-700 p-3 bg-slate-900/50 text-center text-xs text-slate-500">
          Showing all {rows.length} rows
        </div>
      )}
    </div>
  );
}


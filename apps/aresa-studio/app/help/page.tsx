// ARESA Studio - Help & Tutorial

'use client';

import Link from 'next/link';
import { Book, Terminal, Database, Zap, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-300">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
      </button>
    </div>
  );
}

interface CommandCardProps {
  title: string;
  description: string;
  commands: { label: string; code: string; note?: string }[];
  icon: React.ReactNode;
  color: string;
}

function CommandCard({ title, description, commands, icon, color }: CommandCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-4">
        {commands.map((cmd, idx) => (
          <div key={idx}>
            <p className="text-sm text-slate-300 mb-2">{cmd.label}</p>
            <CodeBlock code={cmd.code} />
            {cmd.note && (
              <p className="text-xs text-slate-500 mt-1 italic">{cmd.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HelpPage() {
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
            <span className="text-slate-300">Help & Tutorial</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ARESA CLI Reference
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Query any database from your terminal. Fast, simple, and powerful.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400" size={24} />
            Quick Start
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-300 mb-2">1. Add a connection:</p>
              <CodeBlock code='aresa config add postgres mydb --uri "postgresql://user:pass@host/db"' />
            </div>
            <div>
              <p className="text-sm text-slate-300 mb-2">2. Run a query:</p>
              <CodeBlock code='aresa query mydb "SELECT * FROM users LIMIT 10"' />
            </div>
          </div>
        </div>

        {/* Database Commands */}
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Database className="text-cyan-400" size={28} />
          Database Commands
        </h2>

        <div className="grid gap-6 mb-12">
          {/* BigQuery */}
          <CommandCard
            title="BigQuery"
            description="Google BigQuery data warehouse"
            icon={<Database size={20} className="text-white" />}
            color="bg-blue-600"
            commands={[
              {
                label: 'Add a BigQuery connection:',
                code: 'aresa config add bigquery prod --project my-gcp-project',
                note: 'Uses Application Default Credentials (gcloud auth login)',
              },
              {
                label: 'Run a query:',
                code: 'aresa query prod "SELECT * FROM `dataset.table` LIMIT 10"',
              },
              {
                label: 'Query with output format:',
                code: 'aresa query prod "SELECT * FROM users" --format json',
              },
            ]}
          />

          {/* PostgreSQL */}
          <CommandCard
            title="PostgreSQL"
            description="The world's most advanced open source database"
            icon={<Database size={20} className="text-white" />}
            color="bg-indigo-600"
            commands={[
              {
                label: 'Add a PostgreSQL connection:',
                code: 'aresa config add postgres mydb --uri "postgresql://user:password@localhost:5432/database"',
              },
              {
                label: 'Run a query:',
                code: 'aresa query mydb "SELECT * FROM users WHERE active = true"',
              },
              {
                label: 'Export results to CSV:',
                code: 'aresa query mydb "SELECT * FROM orders" --format csv > orders.csv',
              },
            ]}
          />

          {/* MySQL */}
          <CommandCard
            title="MySQL"
            description="Popular open-source relational database"
            icon={<Database size={20} className="text-white" />}
            color="bg-orange-600"
            commands={[
              {
                label: 'Add a MySQL connection:',
                code: 'aresa config add mysql mydb --uri "mysql://user:password@localhost:3306/database"',
              },
              {
                label: 'Run a query:',
                code: 'aresa query mydb "SELECT COUNT(*) FROM products"',
              },
            ]}
          />

          {/* ClickHouse */}
          <CommandCard
            title="ClickHouse"
            description="Fast open-source OLAP database"
            icon={<Database size={20} className="text-white" />}
            color="bg-yellow-600"
            commands={[
              {
                label: 'Add a ClickHouse connection:',
                code: 'aresa config add clickhouse analytics --host localhost --port 8123',
              },
              {
                label: 'Run a query:',
                code: 'aresa query analytics "SELECT count() FROM events WHERE date > today() - 7"',
              },
            ]}
          />

          {/* SQLite */}
          <CommandCard
            title="SQLite"
            description="Lightweight embedded database"
            icon={<Database size={20} className="text-white" />}
            color="bg-green-600"
            commands={[
              {
                label: 'Add a SQLite connection:',
                code: 'aresa config add sqlite local --uri "/path/to/database.db"',
              },
              {
                label: 'Run a query:',
                code: 'aresa query local "SELECT * FROM sqlite_master WHERE type=\'table\'"',
              },
            ]}
          />

          {/* Snowflake */}
          <CommandCard
            title="Snowflake"
            description="Cloud data warehouse platform"
            icon={<Database size={20} className="text-white" />}
            color="bg-cyan-600"
            commands={[
              {
                label: 'Add a Snowflake connection:',
                code: 'aresa config add snowflake prod --account xy12345.us-east-1 --warehouse COMPUTE_WH --user myuser',
                note: 'Password stored securely in system keychain',
              },
              {
                label: 'Run a query:',
                code: 'aresa query prod "SELECT * FROM MY_DB.PUBLIC.USERS LIMIT 10"',
              },
              {
                label: 'List schemas:',
                code: 'aresa schema prod',
              },
            ]}
          />

          {/* Databricks */}
          <CommandCard
            title="Databricks"
            description="Unified analytics and AI platform"
            icon={<Database size={20} className="text-white" />}
            color="bg-red-600"
            commands={[
              {
                label: 'Add a Databricks connection:',
                code: 'aresa config add databricks lakehouse --host adb-123.azuredatabricks.net --warehouse abc123 --token dapi...',
                note: 'Requires SQL Warehouse ID and Personal Access Token',
              },
              {
                label: 'Run a query:',
                code: 'aresa query lakehouse "SELECT * FROM main.default.customers LIMIT 10"',
              },
              {
                label: 'With Unity Catalog:',
                code: 'aresa query lakehouse "SELECT * FROM catalog.schema.table"',
              },
            ]}
          />
        </div>

        {/* Configuration Commands */}
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Terminal className="text-purple-400" size={28} />
          Configuration Commands
        </h2>

        <div className="grid gap-6 mb-12">
          <CommandCard
            title="Manage Connections"
            description="Add, remove, and list database connections"
            icon={<Terminal size={20} className="text-white" />}
            color="bg-purple-600"
            commands={[
              {
                label: 'List all connections:',
                code: 'aresa config list',
              },
              {
                label: 'Test a connection:',
                code: 'aresa config test mydb',
              },
              {
                label: 'Remove a connection:',
                code: 'aresa config remove mydb',
              },
              {
                label: 'Check all connections:',
                code: 'aresa config check',
              },
            ]}
          />
        </div>

        {/* Output Formats */}
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Book className="text-green-400" size={28} />
          Output Formats
        </h2>

        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6 mb-12">
          <p className="text-slate-300 mb-4">
            ARESA supports multiple output formats for query results:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-cyan-400 mb-2">Table (default)</p>
              <CodeBlock code='aresa query mydb "SELECT * FROM users" --format table' />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-400 mb-2">JSON</p>
              <CodeBlock code='aresa query mydb "SELECT * FROM users" --format json' />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-400 mb-2">CSV</p>
              <CodeBlock code='aresa query mydb "SELECT * FROM users" --format csv' />
            </div>
            <div>
              <p className="text-sm font-medium text-cyan-400 mb-2">Markdown</p>
              <CodeBlock code='aresa query mydb "SELECT * FROM users" --format markdown' />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">💡 Pro Tips</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Use <code className="bg-slate-800 px-2 py-0.5 rounded text-sm">--limit N</code> to restrict result rows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Pipe to <code className="bg-slate-800 px-2 py-0.5 rounded text-sm">jq</code> for JSON processing: <code className="bg-slate-800 px-2 py-0.5 rounded text-sm">aresa query mydb "..." --format json | jq '.[]'</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Store sensitive URIs securely - ARESA uses your system's keychain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              <span>Config file location: <code className="bg-slate-800 px-2 py-0.5 rounded text-sm">~/.config/aresa/config.toml</code></span>
            </li>
          </ul>
        </div>

        {/* Links */}
        <div className="text-center text-slate-400">
          <p className="mb-4">Need more help?</p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ExternalLink size={16} />
              Back to Dashboard
            </Link>
            <Link href="/query" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ExternalLink size={16} />
              Try Query Editor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}





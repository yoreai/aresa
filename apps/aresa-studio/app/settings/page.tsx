'use client';

import Link from 'next/link';
import { Settings, Database, Zap, Info } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ARESA Studio
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">Settings</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* About */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Info className="text-cyan-400" size={24} />
              About ARESA Studio
            </h2>
            <div className="space-y-3 text-slate-300">
              <p><span className="text-slate-400">Version:</span> 0.2.0</p>
              <p><span className="text-slate-400">Backend:</span> Rust + Axum</p>
              <p><span className="text-slate-400">Frontend:</span> Next.js 14 + React 18</p>
              <p className="text-sm text-slate-400 mt-4">
                ARESA Studio is the web interface for ARESA CLI - a universal database management tool.
              </p>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="text-blue-400" size={24} />
              Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Config Location</p>
                <p className="font-mono text-sm text-slate-300 bg-slate-900/50 p-2 rounded">
                  ~/.config/aresa/config.toml
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">API Endpoint</p>
                <p className="font-mono text-sm text-slate-300 bg-slate-900/50 p-2 rounded">
                  http://localhost:3001/api
                </p>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-yellow-400" size={24} />
              Performance Tips
            </h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Use LIMIT in queries to avoid fetching too much data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Test connections regularly with the ping feature</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Use the schema explorer instead of SELECT * to understand data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Export large result sets to CSV for analysis</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <div className="space-y-2">
              <a href="https://github.com/yoreai/aresa" target="_blank" rel="noopener noreferrer"
                className="block text-cyan-400 hover:text-cyan-300 text-sm">
                GitHub Repository →
              </a>
              <a href="/terminal" className="block text-cyan-400 hover:text-cyan-300 text-sm">
                Terminal Access →
              </a>
              <a href="/connections" className="block text-cyan-400 hover:text-cyan-300 text-sm">
                Manage Connections →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ARESA Studio - Terminal Emulator

'use client';

import Link from 'next/link';
import { Terminal as TerminalIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const Terminal = dynamic(() => import('@/components/Terminal'), { ssr: false });

export default function TerminalPage() {
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
            <span className="text-slate-300">Terminal</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <TerminalIcon size={16} />
            <span>Interactive ARESA CLI</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-120px)]">
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 h-full">
          <Terminal />
        </div>
      </div>
    </div>
  );
}


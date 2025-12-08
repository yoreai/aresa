'use client';

import { Database, Activity, Cloud, Server, HardDrive } from 'lucide-react';
import { Connection } from '@/lib/api';

export function ConnectionCard({ connection, onClick }: { connection: Connection; onClick?: () => void }) {
  const statusColor = connection.status === 'connected' ? 'bg-green-500' : 'bg-slate-500';

  // Parse connection details to extract relevant info
  const getConnectionInfo = () => {
    const details = connection.details || '';
    const projectMatch = details.match(/project:\s*Some\("([^"]+)"\)/);
    const hostMatch = details.match(/host:\s*Some\("([^"]+)"\)/);
    const dbMatch = details.match(/database:\s*Some\("([^"]+)"\)/);

    return {
      project: projectMatch ? projectMatch[1] : null,
      host: hostMatch ? hostMatch[1] : null,
      database: dbMatch ? dbMatch[1] : null,
    };
  };

  const info = getConnectionInfo();

  // Get icon based on type
  const getIcon = () => {
    switch (connection.type) {
      case 'bigquery':
        return <Cloud className="text-blue-400" size={20} />;
      case 'postgres':
      case 'mysql':
        return <Server className="text-green-400" size={20} />;
      case 'sqlite':
      case 'duckdb':
        return <HardDrive className="text-orange-400" size={20} />;
      default:
        return <Database className="text-cyan-400" size={20} />;
    }
  };

  // Get badge color based on type
  const getBadgeColor = () => {
    switch (connection.type) {
      case 'bigquery':
        return 'bg-blue-500/20 text-blue-400';
      case 'postgres':
        return 'bg-green-500/20 text-green-400';
      case 'mysql':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-cyan-500/20 text-cyan-400';
    }
  };

  // Get display info
  const getDisplayInfo = () => {
    if (connection.type === 'bigquery' && info.project) {
      return info.project;
    }
    if (info.host) {
      return info.database ? `${info.host}/${info.database}` : info.host;
    }
    return connection.type;
  };

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur border border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getBadgeColor()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">{connection.name}</h3>
              <p className="text-sm text-slate-400">{connection.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
            <Activity size={14} className="text-slate-500" />
          </div>
        </div>

        <p className="text-xs text-cyan-400 font-mono truncate">
          {getDisplayInfo()}
        </p>
      </div>
    </div>
  );
}


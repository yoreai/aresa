'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface QueryTab {
  id: string;
  name: string;
  query: string;
  source: string;
}

interface QueryTabsProps {
  onTabChange: (query: string, source: string) => void;
}

export function QueryTabs({ onTabChange }: QueryTabsProps) {
  const [tabs, setTabs] = useState<QueryTab[]>([
    { id: '1', name: 'Query 1', query: 'SELECT * FROM table_name LIMIT 10;', source: '' }
  ]);
  const [activeTab, setActiveTab] = useState('1');

  const addTab = () => {
    const newId = String(tabs.length + 1);
    const newTab: QueryTab = {
      id: newId,
      name: `Query ${tabs.length + 1}`,
      query: '',
      source: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
    onTabChange('', '');
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return; // Keep at least one tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) {
      const newActive = newTabs[0];
      setActiveTab(newActive.id);
      onTabChange(newActive.query, newActive.source);
    }
  };

  const switchTab = (id: string) => {
    setActiveTab(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      onTabChange(tab.query, tab.source);
    }
  };

  return (
    <div className="flex items-center gap-1 border-b border-slate-700 bg-slate-900/30 px-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => switchTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-t transition-colors ${
            activeTab === tab.id
              ? 'bg-slate-800 text-white border-t border-x border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <span className="text-sm">{tab.name}</span>
          {tabs.length > 1 && (
            <X
              size={14}
              className="hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            />
          )}
        </button>
      ))}
      <button
        onClick={addTab}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded transition-colors"
        title="New query tab"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}


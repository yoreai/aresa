"use client";

import { useState } from "react";

interface MultiSelectFilterProps {
  label: string;
  emoji: string;
  options: (string | number)[];
  defaultSelected: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
}

export default function MultiSelectFilter({
  label,
  emoji,
  options,
  defaultSelected,
  onChange,
}: MultiSelectFilterProps) {
  const [selected, setSelected] = useState<(string | number)[]>(defaultSelected);

  const toggleItem = (item: string | number) => {
    const newSelected = selected.includes(item)
      ? selected.filter((i) => i !== item)
      : [...selected, item];
    setSelected(newSelected);
    onChange(newSelected);
  };

  const selectAll = () => {
    setSelected(options);
    onChange(options);
  };

  const clearAll = () => {
    setSelected([]);
    onChange([]);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold mb-3 text-gray-200">
        {emoji} {label}
      </label>
      <div className="flex gap-2 mb-2">
        <button
          onClick={selectAll}
          className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition"
        >
          Select All
        </button>
        <button
          onClick={clearAll}
          className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded transition"
        >
          Clear All
        </button>
        <span className="text-xs text-gray-400 ml-auto self-center">
          {selected.length} of {options.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-gray-700/30 p-3 rounded">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-600/50 p-2 rounded transition"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleItem(option)}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-sm text-gray-200">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}



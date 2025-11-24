"use client";

import { useState } from "react";

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  year: string;
  incidentType: string;
  municipality: string;
}

export default function Filters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    year: "all",
    incidentType: "all",
    municipality: "all",
  });

  const years = ["all", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];
  const incidentTypes = [
    "all",
    "Fire Alarms",
    "Structure Fires",
    "Outdoor Fires",
    "Vehicle Fires",
    "Medical Assists",
  ];
  const municipalities = [
    "all",
    "Pittsburgh",
    "Penn Hills",
    "Bethel Park",
    "Mt. Lebanon",
    "Ross Township",
  ];

  const handleChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">Year</label>
        <select
          value={filters.year}
          onChange={(e) => handleChange("year", e.target.value)}
          className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year === "all" ? "All Years" : year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">Incident Type</label>
        <select
          value={filters.incidentType}
          onChange={(e) => handleChange("incidentType", e.target.value)}
          className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {incidentTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All Types" : type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">Municipality</label>
        <select
          value={filters.municipality}
          onChange={(e) => handleChange("municipality", e.target.value)}
          className="w-full bg-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {municipalities.map((muni) => (
            <option key={muni} value={muni}>
              {muni === "all" ? "All Municipalities" : muni}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          const resetFilters = { year: "all", incidentType: "all", municipality: "all" };
          setFilters(resetFilters);
          onFilterChange?.(resetFilters);
        }}
        className="text-sm text-blue-400 hover:text-blue-300 transition mt-4 block"
      >
        Reset All Filters
      </button>
    </div>
  );
}

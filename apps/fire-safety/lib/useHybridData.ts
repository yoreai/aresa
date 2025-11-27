/**
 * Hybrid Data Hook - Best of both worlds
 *
 * 1. Initial load: Pre-aggregated JSON (instant ~200ms)
 * 2. Background: Initialize DuckDB-WASM (~2-3s)
 * 3. Filters: Use DuckDB if ready (instant), otherwise fallback to JS filtering
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  initDuckDB,
  isDuckDBReady,
  aggregateByYearSQL,
  aggregateBySeasonSQL,
  aggregateByCitySQL,
  aggregateByPrioritySQL,
  aggregateFalseAlarmsSQL,
  calculateStatsSQL,
  getFilteredIncidents,
} from "./duckdb-service";

// Pre-aggregated data URL
const AGGREGATIONS_URL = "/data/aggregations.json";

type DataSource = "precomputed" | "duckdb" | "fallback";

interface Stats {
  total: number;
  avgPerYear: number;
  structureFires: number;
  fireAlarms: number;
  alarmPercentage: string;
  highPriorityIncidents: number;
}

const defaultStats: Stats = {
  total: 0,
  avgPerYear: 0,
  structureFires: 0,
  fireAlarms: 0,
  alarmPercentage: "0",
  highPriorityIncidents: 0,
};

export function useHybridData() {
  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>("precomputed");

  // Pre-aggregated data (original, unfiltered)
  const preAggRef = useRef<any>(null);

  // Current data (filtered or original)
  const [byYear, setByYear] = useState<any[]>([]);
  const [bySeason, setBySeason] = useState<any[]>([]);
  const [byCity, setByCity] = useState<any[]>([]);
  const [byPriority, setByPriority] = useState<any[]>([]);
  const [falseAlarms, setFalseAlarms] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [filteredIncidents, setFilteredIncidents] = useState<any[]>([]);

  // Track DuckDB initialization
  const [duckdbReady, setDuckdbReady] = useState(false);
  const duckdbInitStarted = useRef(false);
  const initialIncidentsLoaded = useRef(false);

  // 1. Load pre-aggregated JSON (instant first paint)
  useEffect(() => {
    async function loadPreAggregated() {
      try {
        console.log("⚡ Loading pre-aggregated data...");
        const startTime = performance.now();

        const response = await fetch(AGGREGATIONS_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        preAggRef.current = data;

        // Set initial data
        setByYear(data.byYear || []);
        setBySeason(data.bySeason || []);
        setByCity(data.byCity || []);
        setByPriority(data.byPriority || []);
        setFalseAlarms(data.falseAlarms || []);
        setStats(data.stats || defaultStats);
        setCities(data.topCities || []);
        setFilteredCount(data.stats?.total || 0);

        const elapsed = ((performance.now() - startTime)).toFixed(0);
        console.log(`✅ Pre-aggregated data loaded in ${elapsed}ms (${data.stats?.total?.toLocaleString()} records)`);

        setInitialLoading(false);
      } catch (error) {
        console.error("Failed to load pre-aggregated data:", error);
        setInitialLoading(false);
      }
    }

    loadPreAggregated();
  }, []);

  // 2. Initialize DuckDB in background (for fast filtering)
  useEffect(() => {
    // Skip if already initialized (DuckDB persists across re-renders)
    if (isDuckDBReady()) {
      setDuckdbReady(true);
      // Load incidents if not already loaded
      if (!initialIncidentsLoaded.current) {
        initialIncidentsLoaded.current = true;
        getFilteredIncidents([], [], []).then(incidents => {
          setFilteredIncidents(incidents);
          console.log(`📍 Loaded ${incidents.length.toLocaleString()} incidents for maps`);
        });
      }
      return;
    }

    if (duckdbInitStarted.current) return;
    duckdbInitStarted.current = true;

    async function initDB() {
      try {
        console.log("🦆 Starting DuckDB initialization in background...");
        await initDuckDB();
        setDuckdbReady(true);
        console.log("🦆 DuckDB ready for instant filtering!");

        // Load initial incidents for maps (unfiltered)
        if (!initialIncidentsLoaded.current) {
          initialIncidentsLoaded.current = true;
          console.log("📍 Loading initial map incidents...");
          const incidents = await getFilteredIncidents([], [], []);
          setFilteredIncidents(incidents);
          console.log(`📍 Loaded ${incidents.length.toLocaleString()} incidents for maps`);
        }
      } catch (error) {
        console.error("DuckDB initialization failed (falling back to JS filtering):", error);
        // App still works with pre-aggregated data + JS filtering
      }
    }

    // Start DuckDB initialization immediately (don't use timeout which can be cancelled)
    initDB();
  }, []);

  // 3. Apply filters
  const applyFilters = useCallback(async (
    years: number[],
    types: string[],
    citiesFilter: string[]
  ) => {
    const preAgg = preAggRef.current;
    if (!preAgg) return;

    // Check if we have any actual filters applied
    const allYears = preAgg.metadata?.years?.map(Number) || [];
    const hasYearFilter = years.length > 0 && years.length < allYears.length;
    const hasTypeFilter = types.length > 0 && types.length < 10; // Less than all types
    const hasCityFilter = citiesFilter.length > 0;
    const hasFilters = hasYearFilter || hasTypeFilter || hasCityFilter;

    // If no filters, use pre-aggregated data (instant)
    if (!hasFilters) {
      setByYear(preAgg.byYear || []);
      setBySeason(preAgg.bySeason || []);
      setByCity(preAgg.byCity || []);
      setByPriority(preAgg.byPriority || []);
      setFalseAlarms(preAgg.falseAlarms || []);
      setStats(preAgg.stats || defaultStats);
      setFilteredCount(preAgg.stats?.total || 0);
      setDataSource("precomputed");

      // Load all incidents for maps if DuckDB is ready
      if (isDuckDBReady()) {
        getFilteredIncidents([], [], []).then(incidents => {
          setFilteredIncidents(incidents);
          console.log(`📍 Loaded ${incidents.length.toLocaleString()} incidents for maps (unfiltered)`);
        });
      }
      return;
    }

    // Use DuckDB if ready (fast SQL queries)
    if (isDuckDBReady()) {
      setFilterLoading(true);
      setDataSource("duckdb");

      try {
        console.log("🔍 Filtering with DuckDB SQL...");
        const startTime = performance.now();

        const [
          yearData,
          seasonData,
          cityData,
          priorityData,
          alarmData,
          statsData,
          incidents
        ] = await Promise.all([
          aggregateByYearSQL(years, types, citiesFilter),
          aggregateBySeasonSQL(years, types, citiesFilter),
          aggregateByCitySQL(years, types, citiesFilter),
          aggregateByPrioritySQL(years, types, citiesFilter),
          aggregateFalseAlarmsSQL(years, types, citiesFilter),
          calculateStatsSQL(years, types, citiesFilter),
          getFilteredIncidents(years, types, citiesFilter),
        ]);

        const elapsed = ((performance.now() - startTime)).toFixed(0);
        console.log(`✅ DuckDB filtering complete in ${elapsed}ms (${statsData.total?.toLocaleString()} results)`);

        setByYear(yearData);
        setBySeason(seasonData);
        setByCity(cityData);
        setByPriority(priorityData);
        setFalseAlarms(alarmData);
        setStats(statsData);
        setFilteredCount(statsData.total || 0);
        setFilteredIncidents(incidents);
      } catch (error) {
        console.error("DuckDB query failed:", error);
        setDataSource("fallback");
      } finally {
        setFilterLoading(false);
      }
    } else {
      // DuckDB not ready yet - show loading and wait
      console.log("⏳ DuckDB still initializing, please wait...");
      setFilterLoading(true);
      setDataSource("fallback");

      // Set a timeout to retry when DuckDB is ready
      const checkInterval = setInterval(() => {
        if (isDuckDBReady()) {
          clearInterval(checkInterval);
          applyFilters(years, types, citiesFilter);
        }
      }, 500);

      // Clear interval after 10 seconds to avoid infinite loop
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }, []);

  return {
    // Loading states
    initialLoading,
    filterLoading,
    dataSource,
    duckdbReady,

    // Aggregated data
    byYear,
    bySeason,
    byCity,
    byPriority,
    falseAlarms,
    stats,
    cities,

    // Counts
    filteredCount,
    totalCount: preAggRef.current?.stats?.total || 0,

    // Raw filtered data (for maps)
    filteredIncidents,

    // Actions
    applyFilters,
  };
}

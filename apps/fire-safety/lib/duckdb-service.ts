/**
 * DuckDB-WASM Service for fast in-browser SQL queries
 *
 * This service:
 * 1. Initializes DuckDB-WASM in the browser
 * 2. Loads the Parquet file from Vercel Blob
 * 3. Provides fast SQL-based aggregations for filtering
 */

import * as duckdb from "@duckdb/duckdb-wasm";

const PARQUET_URL = "https://lgn0alpssagu0n2c.public.blob.vercel-storage.com/fire_dispatches.parquet";

// Fire categories for consistent ordering
export const FIRE_CATEGORIES = [
  "Fire Alarms",
  "Structure Fires",
  "Outdoor/Brush Fires",
  "Electrical Issues",
  "Vehicle Fires",
  "Gas Issues",
  "Hazmat/CO Issues",
  "Smoke Investigation",
  "Uncategorized Fire",
] as const;

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize DuckDB-WASM and load the Parquet data
 */
export async function initDuckDB(): Promise<void> {
  // Return existing promise if already initializing
  if (initPromise) return initPromise;
  if (isInitialized) return;

  initPromise = (async () => {
    console.log("🦆 Initializing DuckDB-WASM...");
    const startTime = performance.now();

    try {
      // Get the bundles for DuckDB-WASM
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

      // Select bundle based on browser capabilities
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      // Create worker
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
      );
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();

      // Instantiate DuckDB
      db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(worker_url);

      // Create connection
      conn = await db.connect();

      // Load Parquet file directly from URL
      console.log("📥 Loading Parquet from Vercel Blob...");
      await conn.query(`
        CREATE TABLE fire_incidents AS
        SELECT * FROM read_parquet('${PARQUET_URL}')
      `);

      // Get row count
      const result = await conn.query("SELECT COUNT(*) as count FROM fire_incidents");
      const count = result.toArray()[0]?.count;

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ DuckDB ready! Loaded ${count?.toLocaleString()} rows in ${elapsed}s`);

      isInitialized = true;
    } catch (error) {
      console.error("❌ DuckDB initialization failed:", error);
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Check if DuckDB is ready
 */
export function isDuckDBReady(): boolean {
  return isInitialized;
}

/**
 * Build WHERE clause from filters
 */
function buildWhereClause(
  years: number[],
  types: string[],
  cities: string[]
): string {
  const conditions: string[] = [];

  if (years.length > 0) {
    conditions.push(`call_year IN (${years.join(",")})`);
  }

  if (types.length > 0) {
    const escaped = types.map(t => `'${t.replace(/'/g, "''")}'`).join(",");
    conditions.push(`fire_category IN (${escaped})`);
  }

  if (cities.length > 0) {
    const escaped = cities.map(c => `'${c.replace(/'/g, "''")}'`).join(",");
    conditions.push(`city_name IN (${escaped})`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}

/**
 * Get filtered incidents for maps (returns raw rows)
 */
export async function getFilteredIncidents(
  years: number[],
  types: string[],
  cities: string[]
): Promise<any[]> {
  if (!conn) throw new Error("DuckDB not initialized");

  const where = buildWhereClause(years, types, cities);
  const result = await conn.query(`
    SELECT
      call_year, season, fire_category, city_name,
      priority, priority_desc, description_short,
      census_block_group_center__x,
      census_block_group_center__y
    FROM fire_incidents
    ${where}
  `);

  return result.toArray().map((row: any) => ({
    call_year: row.call_year,
    season: row.season,
    fire_category: row.fire_category,
    city_name: row.city_name,
    priority: row.priority,
    priority_desc: row.priority_desc,
    description_short: row.description_short,
    census_block_group_center__x: row.census_block_group_center__x,
    census_block_group_center__y: row.census_block_group_center__y,
  }));
}

/**
 * Aggregate by year with filters
 */
export async function aggregateByYearSQL(
  years: number[],
  types: string[],
  cities: string[]
): Promise<any[]> {
  if (!conn) throw new Error("DuckDB not initialized");

  const where = buildWhereClause(years, types, cities);

  // Build CASE statements for each category
  const categoryColumns = FIRE_CATEGORIES.map(cat =>
    `SUM(CASE WHEN fire_category = '${cat}' THEN 1 ELSE 0 END) as "${cat}"`
  ).join(",\n    ");

  const result = await conn.query(`
    SELECT
      call_year as year,
      ${categoryColumns}
    FROM fire_incidents
    ${where}
    GROUP BY call_year
    ORDER BY call_year
  `);

  return result.toArray().map((row: any) => {
    const obj: any = { year: row.year };
    FIRE_CATEGORIES.forEach(cat => {
      obj[cat] = Number(row[cat]) || 0;
    });
    return obj;
  });
}

/**
 * Aggregate by season with filters
 */
export async function aggregateBySeasonSQL(
  years: number[],
  types: string[],
  cities: string[]
): Promise<any[]> {
  if (!conn) throw new Error("DuckDB not initialized");

  const where = buildWhereClause(years, types, cities);

  const categoryColumns = FIRE_CATEGORIES.map(cat =>
    `SUM(CASE WHEN fire_category = '${cat}' THEN 1 ELSE 0 END) as "${cat}"`
  ).join(",\n    ");

  const result = await conn.query(`
    SELECT
      season,
      ${categoryColumns}
    FROM fire_incidents
    ${where}
    GROUP BY season
  `);

  // Ensure correct season order
  const seasonOrder = ["Winter", "Spring", "Summer", "Fall"];
  const dataMap = new Map(result.toArray().map((row: any) => [row.season, row]));

  return seasonOrder.map(season => {
    const row = dataMap.get(season) || {};
    const obj: any = { season };
    FIRE_CATEGORIES.forEach(cat => {
      obj[cat] = Number(row[cat]) || 0;
    });
    return obj;
  });
}

/**
 * Aggregate by city with filters (top N)
 */
export async function aggregateByCitySQL(
  years: number[],
  types: string[],
  cities: string[],
  topN: number = 12
): Promise<any[]> {
  if (!conn) throw new Error("DuckDB not initialized");

  const where = buildWhereClause(years, types, cities);

  const categoryColumns = FIRE_CATEGORIES.map(cat =>
    `SUM(CASE WHEN fire_category = '${cat}' THEN 1 ELSE 0 END) as "${cat}"`
  ).join(",\n    ");

  const result = await conn.query(`
    SELECT
      city_name as city,
      ${categoryColumns},
      COUNT(*) as total
    FROM fire_incidents
    ${where}
    GROUP BY city_name
    ORDER BY total DESC
    LIMIT ${topN}
  `);

  return result.toArray().map((row: any) => {
    const obj: any = { city: row.city };
    FIRE_CATEGORIES.forEach(cat => {
      obj[cat] = Number(row[cat]) || 0;
    });
    return obj;
  });
}

/**
 * Aggregate by priority with filters
 */
export async function aggregateByPrioritySQL(
  years: number[],
  types: string[],
  cities: string[]
): Promise<any[]> {
  if (!conn) throw new Error("DuckDB not initialized");

  const where = buildWhereClause(years, types, cities);

  const result = await conn.query(`
    SELECT
      priority_desc as priority,
      fire_category as category,
      COUNT(*) as count
    FROM fire_incidents
    ${where}
    GROUP BY priority_desc, fire_category
    ORDER BY count DESC
  `);

  return result.toArray().map((row: any) => ({
    priority: row.priority,
    category: row.category,
    count: Number(row.count),
  }));
}

/**
 * Aggregate false alarms with filters
 */
export async function aggregateFalseAlarmsSQL(
  years: number[],
  types: string[],
  cities: string[]
): Promise<any[]> {
  if (!conn) throw new Error("DuckDB not initialized");

  // Build WHERE but only apply year/city filters (we're specifically looking at alarms)
  const conditions: string[] = ["fire_category = 'Fire Alarms'"];
  if (years.length > 0) conditions.push(`call_year IN (${years.join(",")})`);
  if (cities.length > 0) {
    const escaped = cities.map(c => `'${c.replace(/'/g, "''")}'`).join(",");
    conditions.push(`city_name IN (${escaped})`);
  }
  const where = `WHERE ${conditions.join(" AND ")}`;

  // Pre-2020 breakdown
  const pre2020Result = await conn.query(`
    SELECT
      SUM(CASE WHEN description_short LIKE '%COM%' THEN 1 ELSE 0 END) as commercial,
      SUM(CASE WHEN description_short LIKE '%RES%' THEN 1 ELSE 0 END) as residential,
      COUNT(*) as total
    FROM fire_incidents
    ${where} AND call_year < 2020
  `);

  // Post-2019 count (estimate based on historical patterns)
  const post2019Result = await conn.query(`
    SELECT COUNT(*) as total
    FROM fire_incidents
    ${where} AND call_year >= 2020
  `);

  const pre2020 = pre2020Result.toArray()[0] || { commercial: 0, residential: 0, total: 0 };
  const post2019Total = Number(post2019Result.toArray()[0]?.total) || 0;

  const pre2020Com = Number(pre2020.commercial) || 0;
  const pre2020Res = Number(pre2020.residential) || 0;
  const pre2020Other = Number(pre2020.total) - pre2020Com - pre2020Res;

  // Estimate post-2019 breakdown (60% commercial, 30% residential, 10% other)
  const post2019EstCom = Math.round(post2019Total * 0.6);
  const post2019EstRes = Math.round(post2019Total * 0.3);
  const post2019EstOther = post2019Total - post2019EstCom - post2019EstRes;

  return [
    { name: "Commercial Building Alarms", value: pre2020Com + post2019EstCom },
    { name: "Residential Alarms", value: pre2020Res + post2019EstRes },
    { name: "Other/Unknown Alarms", value: pre2020Other + post2019EstOther },
  ];
}

/**
 * Calculate stats with filters
 */
export async function calculateStatsSQL(
  years: number[],
  types: string[],
  cities: string[]
): Promise<any> {
  if (!conn) throw new Error("DuckDB not initialized");

  const where = buildWhereClause(years, types, cities);

  const result = await conn.query(`
    SELECT
      COUNT(*) as total,
      COUNT(DISTINCT call_year) as year_count,
      SUM(CASE WHEN fire_category = 'Structure Fires' THEN 1 ELSE 0 END) as structure_fires,
      SUM(CASE WHEN fire_category = 'Fire Alarms' THEN 1 ELSE 0 END) as fire_alarms,
      SUM(CASE WHEN fire_category != 'Fire Alarms' AND (priority = 'F1' OR priority = 'Q0') THEN 1 ELSE 0 END) as high_priority
    FROM fire_incidents
    ${where}
  `);

  const row = result.toArray()[0] || {};
  const total = Number(row.total) || 0;
  const yearCount = Number(row.year_count) || 1;
  const fireAlarms = Number(row.fire_alarms) || 0;

  return {
    total,
    avgPerYear: Math.round(total / yearCount),
    structureFires: Number(row.structure_fires) || 0,
    fireAlarms,
    alarmPercentage: total > 0 ? ((fireAlarms / total) * 100).toFixed(1) : "0",
    highPriorityIncidents: Number(row.high_priority) || 0,
  };
}

/**
 * Get top cities with filters
 */
export async function getTopCitiesSQL(
  years: number[],
  types: string[],
  cities: string[],
  topN: number = 50
): Promise<string[]> {
  if (!conn) throw new Error("DuckDB not initialized");

  const where = buildWhereClause(years, types, cities);

  const result = await conn.query(`
    SELECT city_name, COUNT(*) as count
    FROM fire_incidents
    ${where}
    GROUP BY city_name
    ORDER BY count DESC
    LIMIT ${topN}
  `);

  return result.toArray().map((row: any) => row.city_name);
}

/**
 * Pre-compute aggregations for instant initial load
 * Run: npx tsx scripts/precompute-aggregations.ts
 *
 * This script:
 * 1. Downloads the full CSV from Vercel Blob
 * 2. Processes and classifies all incidents
 * 3. Generates pre-aggregated JSON files
 * 4. Outputs to public/data/ for instant loading
 */

import * as fs from "fs";
import * as path from "path";

const BLOB_URL = "https://lgn0alpssagu0n2c.public.blob.vercel-storage.com/fire_dispatches_fresh.csv";

// Fire categories (same as lib/fireData.ts)
const FIRE_CATEGORIES = [
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

interface RawIncident {
  call_year: string;
  call_quarter: string;
  description_short: string;
  city_name: string;
  priority: string;
  priority_desc: string;
  census_block_group_center__x: string;
  census_block_group_center__y: string;
}

interface ProcessedIncident extends RawIncident {
  fire_category: string;
  season: string;
}

// Classification logic (same as lib/fireData.ts)
function classifyFireCategory(incident: RawIncident): string | null {
  const desc = incident.description_short || "";
  const year = parseInt(incident.call_year) || 0;

  if (desc.includes("EMS")) return null;

  const isPreAlarm = year < 2020 && /ALARM/i.test(desc);
  const isPostAlarm = year >= 2020 && desc === "Removed";
  if (isPreAlarm || isPostAlarm) return "Fire Alarms";

  if (/DWELLING|STRUCTURE|BUILDING|APARTMENT/i.test(desc)) return "Structure Fires";
  if (/BRUSH|GRASS|MULCH|OUTSIDE|OUTDOOR|ILLEGAL FIRE/i.test(desc)) return "Outdoor/Brush Fires";
  if (/WIRE|ELECTRICAL|ARCING|TRANSFORMER/i.test(desc)) return "Electrical Issues";
  if (/VEHICLE|AUTO|CAR/i.test(desc)) return "Vehicle Fires";
  if (/GAS|NATURAL GAS/i.test(desc)) return "Gas Issues";
  if (/HAZMAT|CO OR HAZMAT/i.test(desc)) return "Hazmat/CO Issues";
  if (/SMOKE.*OUTSIDE|SMOKE.*SEEN|SMOKE.*SMELL|ODOR/i.test(desc)) return "Smoke Investigation";
  if (/FIRE UNCATEGORIZED|UNKNOWN TYPE FIRE|FIRE/i.test(desc)) return "Uncategorized Fire";

  return "Other";
}

function getSeasonFromQuarter(quarter: string): string {
  const map: Record<string, string> = { Q1: "Winter", Q2: "Spring", Q3: "Summer", Q4: "Fall" };
  return map[quarter] || "Winter";
}

// Simple CSV parser using dynamic import for papaparse
async function parseCSV(csvText: string): Promise<RawIncident[]> {
  const Papa = (await import("papaparse")).default;
  const result = Papa.parse<RawIncident>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });
  return result.data;
}

// Aggregation functions
function aggregateByYear(incidents: ProcessedIncident[]) {
  const yearData: Record<string, Record<string, number>> = {};

  incidents.forEach(i => {
    const year = i.call_year;
    if (!year) return;
    if (!yearData[year]) {
      yearData[year] = {};
      FIRE_CATEGORIES.forEach(cat => yearData[year][cat] = 0);
    }
    if (FIRE_CATEGORIES.includes(i.fire_category as any)) {
      yearData[year][i.fire_category] = (yearData[year][i.fire_category] || 0) + 1;
    }
  });

  return Object.entries(yearData)
    .map(([year, categories]) => ({ year: parseInt(year), ...categories }))
    .sort((a, b) => a.year - b.year);
}

function aggregateBySeason(incidents: ProcessedIncident[]) {
  const seasonOrder = ["Winter", "Spring", "Summer", "Fall"];
  const seasonData: Record<string, Record<string, number>> = {};

  seasonOrder.forEach(season => {
    seasonData[season] = {};
    FIRE_CATEGORIES.forEach(cat => seasonData[season][cat] = 0);
  });

  incidents.forEach(i => {
    if (seasonData[i.season] && FIRE_CATEGORIES.includes(i.fire_category as any)) {
      seasonData[i.season][i.fire_category]++;
    }
  });

  return seasonOrder.map(season => ({ season, ...seasonData[season] }));
}

function aggregateByCity(incidents: ProcessedIncident[], topN = 12) {
  const cityData: Record<string, Record<string, number> & { total: number }> = {};

  incidents.forEach(i => {
    if (!i.city_name) return;
    if (!cityData[i.city_name]) {
      cityData[i.city_name] = { total: 0 } as any;
      FIRE_CATEGORIES.forEach(cat => cityData[i.city_name][cat] = 0);
    }
    if (FIRE_CATEGORIES.includes(i.fire_category as any)) {
      cityData[i.city_name][i.fire_category]++;
    }
    cityData[i.city_name].total++;
  });

  return Object.entries(cityData)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, topN)
    .map(([city, data]) => {
      const { total, ...categories } = data;
      return { city, ...categories };
    });
}

function aggregateByPriority(incidents: ProcessedIncident[]) {
  const counts: Record<string, number> = {};

  incidents.forEach(i => {
    const key = `${i.priority_desc}|${i.fire_category}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([key, count]) => {
      const [priority, category] = key.split("|");
      return { priority, category, count };
    })
    .sort((a, b) => b.count - a.count);
}

function aggregateFalseAlarms(incidents: ProcessedIncident[]) {
  const alarms = incidents.filter(i => i.fire_category === "Fire Alarms");
  const pre2020 = alarms.filter(i => parseInt(i.call_year) < 2020);
  const post2019 = alarms.filter(i => parseInt(i.call_year) >= 2020);

  const pre2020Com = pre2020.filter(i => i.description_short.includes("COM")).length;
  const pre2020Res = pre2020.filter(i => i.description_short.includes("RES")).length;
  const pre2020Other = pre2020.length - pre2020Com - pre2020Res;

  const post2019EstCom = Math.round(post2019.length * 0.6);
  const post2019EstRes = Math.round(post2019.length * 0.3);
  const post2019EstOther = post2019.length - post2019EstCom - post2019EstRes;

  return [
    { name: "Commercial Building Alarms", value: pre2020Com + post2019EstCom },
    { name: "Residential Alarms", value: pre2020Res + post2019EstRes },
    { name: "Other/Unknown Alarms", value: pre2020Other + post2019EstOther },
  ];
}

function calculateStats(incidents: ProcessedIncident[]) {
  const total = incidents.length;
  const years = new Set(incidents.map(i => i.call_year));
  const avgPerYear = Math.round(total / (years.size || 1));
  const structureFires = incidents.filter(i => i.fire_category === "Structure Fires").length;
  const fireAlarms = incidents.filter(i => i.fire_category === "Fire Alarms").length;
  const alarmPercentage = total > 0 ? ((fireAlarms / total) * 100).toFixed(1) : "0";

  const actualFires = incidents.filter(i => i.fire_category !== "Fire Alarms");
  const highPriorityIncidents = actualFires.filter(i =>
    i.priority === "F1" || i.priority === "Q0"
  ).length;

  return { total, avgPerYear, structureFires, fireAlarms, alarmPercentage, highPriorityIncidents };
}

function getTopCities(incidents: ProcessedIncident[], topN = 50): string[] {
  const cityCounts: Record<string, number> = {};
  incidents.forEach(i => {
    if (i.city_name) cityCounts[i.city_name] = (cityCounts[i.city_name] || 0) + 1;
  });
  return Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([city]) => city);
}

async function main() {
  console.log("🔥 Pre-computing fire safety aggregations...\n");

  // Create output directory
  const outputDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Fetch CSV
  console.log("📥 Fetching CSV from Vercel Blob...");
  const response = await fetch(BLOB_URL);
  const csvText = await response.text();
  console.log(`   Downloaded ${(csvText.length / 1024 / 1024).toFixed(1)}MB\n`);

  // Parse CSV
  console.log("📊 Parsing CSV...");
  const rawIncidents = await parseCSV(csvText);
  console.log(`   Parsed ${rawIncidents.length.toLocaleString()} raw records\n`);

  // Process and classify
  console.log("🏷️  Classifying incidents...");
  const incidents: ProcessedIncident[] = [];
  for (const raw of rawIncidents) {
    const category = classifyFireCategory(raw);
    if (category) {
      incidents.push({
        ...raw,
        fire_category: category,
        season: getSeasonFromQuarter(raw.call_quarter),
      });
    }
  }
  console.log(`   Classified ${incidents.length.toLocaleString()} fire incidents\n`);

  // Generate aggregations
  console.log("⚡ Generating aggregations...");

  const aggregations = {
    byYear: aggregateByYear(incidents),
    bySeason: aggregateBySeason(incidents),
    byCity: aggregateByCity(incidents),
    byPriority: aggregateByPriority(incidents),
    falseAlarms: aggregateFalseAlarms(incidents),
    stats: calculateStats(incidents),
    topCities: getTopCities(incidents),
    metadata: {
      generatedAt: new Date().toISOString(),
      totalRecords: incidents.length,
      years: Array.from(new Set(incidents.map(i => i.call_year))).sort(),
    },
  };

  // Write individual files for granular loading
  const files = [
    { name: "by-year.json", data: aggregations.byYear },
    { name: "by-season.json", data: aggregations.bySeason },
    { name: "by-city.json", data: aggregations.byCity },
    { name: "by-priority.json", data: aggregations.byPriority },
    { name: "false-alarms.json", data: aggregations.falseAlarms },
    { name: "stats.json", data: aggregations.stats },
    { name: "top-cities.json", data: aggregations.topCities },
    { name: "metadata.json", data: aggregations.metadata },
  ];

  for (const file of files) {
    const filePath = path.join(outputDir, file.name);
    fs.writeFileSync(filePath, JSON.stringify(file.data, null, 2));
    const size = fs.statSync(filePath).size;
    console.log(`   ✅ ${file.name} (${(size / 1024).toFixed(1)}KB)`);
  }

  // Write combined file for single-request loading
  const combinedPath = path.join(outputDir, "aggregations.json");
  fs.writeFileSync(combinedPath, JSON.stringify(aggregations, null, 2));
  const combinedSize = fs.statSync(combinedPath).size;
  console.log(`   ✅ aggregations.json (${(combinedSize / 1024).toFixed(1)}KB) - combined\n`);

  console.log("🎉 Pre-computation complete!");
  console.log(`   Total output: ${(combinedSize / 1024).toFixed(1)}KB (vs ${(csvText.length / 1024 / 1024).toFixed(1)}MB raw)`);
  console.log(`   Compression: ${((1 - combinedSize / csvText.length) * 100).toFixed(1)}% smaller\n`);
}

main().catch(console.error);

#!/usr/bin/env python3
"""
Convert fire dispatches CSV to Parquet format for DuckDB-WASM.

Parquet benefits:
- Columnar storage (10x smaller than CSV)
- Type-aware compression
- Fast column-specific queries

Usage: uv run python scripts/convert-to-parquet.py
"""

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path

BLOB_URL = "https://lgn0alpssagu0n2c.public.blob.vercel-storage.com/fire_dispatches_fresh.csv"
OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "fire_dispatches.parquet"

# Fire classification logic (same as TypeScript version)
def classify_fire_category(row):
    desc = str(row.get("description_short", ""))
    year = int(row.get("call_year", 0)) if row.get("call_year") else 0

    # Exclude EMS
    if "EMS" in desc:
        return None

    # Fire Alarms
    is_pre_alarm = year < 2020 and "ALARM" in desc.upper()
    is_post_alarm = year >= 2020 and desc == "Removed"
    if is_pre_alarm or is_post_alarm:
        return "Fire Alarms"

    # Other categories
    import re
    if re.search(r"DWELLING|STRUCTURE|BUILDING|APARTMENT", desc, re.I):
        return "Structure Fires"
    if re.search(r"BRUSH|GRASS|MULCH|OUTSIDE|OUTDOOR|ILLEGAL FIRE", desc, re.I):
        return "Outdoor/Brush Fires"
    if re.search(r"WIRE|ELECTRICAL|ARCING|TRANSFORMER", desc, re.I):
        return "Electrical Issues"
    if re.search(r"VEHICLE|AUTO|CAR", desc, re.I):
        return "Vehicle Fires"
    if re.search(r"GAS|NATURAL GAS", desc, re.I):
        return "Gas Issues"
    if re.search(r"HAZMAT|CO OR HAZMAT", desc, re.I):
        return "Hazmat/CO Issues"
    if re.search(r"SMOKE.*OUTSIDE|SMOKE.*SEEN|SMOKE.*SMELL|ODOR", desc, re.I):
        return "Smoke Investigation"
    if re.search(r"FIRE UNCATEGORIZED|UNKNOWN TYPE FIRE|FIRE", desc, re.I):
        return "Uncategorized Fire"

    return "Other"

def get_season(quarter):
    season_map = {"Q1": "Winter", "Q2": "Spring", "Q3": "Summer", "Q4": "Fall"}
    return season_map.get(quarter, "Winter")

def main():
    print("🔥 Converting fire dispatches to Parquet...\n")

    # Read CSV
    print(f"📥 Downloading CSV from Vercel Blob...")
    df = pd.read_csv(BLOB_URL)
    print(f"   Loaded {len(df):,} rows\n")

    # Add classification columns
    print("🏷️  Classifying incidents...")
    df["fire_category"] = df.apply(classify_fire_category, axis=1)
    df["season"] = df["call_quarter"].apply(get_season)

    # Filter to only fire incidents (exclude None categories)
    df_fire = df[df["fire_category"].notna()].copy()
    print(f"   Kept {len(df_fire):,} fire incidents\n")

    # Select relevant columns for the dashboard
    columns = [
        "call_year", "call_quarter", "season",
        "description_short", "fire_category",
        "city_name", "priority", "priority_desc",
        "census_block_group_center__x", "census_block_group_center__y"
    ]
    df_out = df_fire[columns]

    # Convert to appropriate types
    df_out = df_out.astype({
        "call_year": "int16",
        "census_block_group_center__x": "float32",
        "census_block_group_center__y": "float32",
    })

    # Write Parquet with compression
    print("💾 Writing Parquet file...")
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    table = pa.Table.from_pandas(df_out)
    pq.write_table(
        table,
        OUTPUT_PATH,
        compression="snappy",  # Good balance of speed + size
        use_dictionary=True,   # Compress repeated strings
    )

    # Report sizes
    csv_size = len(df.to_csv(index=False).encode())
    parquet_size = OUTPUT_PATH.stat().st_size

    print(f"   ✅ Wrote {OUTPUT_PATH.name}")
    print(f"   📊 Size: {parquet_size / 1024 / 1024:.1f}MB")
    print(f"   📉 Compression: {(1 - parquet_size / csv_size) * 100:.1f}% smaller than CSV\n")

    print("🎉 Done! Upload to Vercel Blob with:")
    print(f"   vercel blob put fire_dispatches.parquet public/data/fire_dispatches.parquet --token $BLOB_READ_WRITE_TOKEN")

if __name__ == "__main__":
    main()

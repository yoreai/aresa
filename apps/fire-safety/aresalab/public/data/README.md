# Fire Zones Static Data

## How to generate fire-zones.geojson

1. **Execute the export function in Supabase:**
```sql
SELECT export_all_fire_zones_geojson();
```

2. **Copy the result and save it as `fire-zones.geojson` in this directory**

3. **The map will automatically use the static file** (fast, no database calls!)

## Benefits
- ✅ No database timeouts or row limits
- ✅ All 1,955 zones load instantly  
- ✅ Works offline
- ✅ Better performance

## File Structure
The GeoJSON should look like:
```json
{
  "type": "FeatureCollection", 
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": 1,
        "fire_hazard_level": "Very High",
        "data_source": "fhsz_sra"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [...]
      }
    }
  ]
}
```
"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../utils/supabase";
import { MapPin, Flame, Eye, EyeOff, Layers } from "lucide-react";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

interface FireHazardZone {
  id: number;
  fire_hazard_level: string;
  data_source: string;
  geometry: any;
}

interface MapStats {
  totalZones: number;
  veryHighRisk: number;
  highRisk: number;
  moderateRisk: number;
}

export function FireHazardMap() {
  const [fireZones, setFireZones] = useState<FireHazardZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layersVisible, setLayersVisible] = useState({
    veryHigh: true,
    high: true,
    moderate: true,
  });
  const [stats, setStats] = useState<MapStats>({
    totalZones: 0,
    veryHighRisk: 0,
    highRisk: 0,
    moderateRisk: 0,
  });
  const mapRef = useRef<any>(null);

  // California center coordinates
  const center: [number, number] = [36.7783, -119.4179];
  const zoom = 6;

  useEffect(() => {
    let leafletModule: any = null;

    const loadLeaflet = async () => {
      try {
        leafletModule = await import("leaflet");
        
        // Fix for default markers
        delete (leafletModule.Icon.Default.prototype as any)._getIconUrl;
        leafletModule.Icon.Default.mergeOptions({
          iconRetinaUrl: "/leaflet-images/marker-icon-2x.png",
          iconUrl: "/leaflet-images/marker-icon.png",
          shadowUrl: "/leaflet-images/marker-shadow.png",
        });
      } catch (err) {
        console.error("Failed to load Leaflet:", err);
      }
    };

    loadLeaflet();
    fetchFireZones();
  }, []);

  const fetchFireZones = async () => {
    try {
      setLoading(true);
      
      console.log("📁 Loading fire zones from static file...");
      
      // Try to load from static GeoJSON file first (fast, no database limits)
      try {
        const response = await fetch('/data/fire-zones.geojson');
        if (response.ok) {
          const geojsonData = await response.json();
          
          if (geojsonData && geojsonData.features) {
            console.log("✅ Loaded", geojsonData.features.length, "zones from static file");
            
            // Convert GeoJSON features to our format
            const zones = geojsonData.features.map((feature: any) => ({
              id: feature.properties.id,
              fire_hazard_level: feature.properties.fire_hazard_level,
              data_source: feature.properties.data_source,
              geometry: feature.geometry
            }));
            
            setFireZones(zones);
            
            // Calculate stats
            const totalZones = zones.length;
            const veryHighRisk = zones.filter((z: any) => z.fire_hazard_level === "Very High").length;
            const highRisk = zones.filter((z: any) => z.fire_hazard_level === "High").length;
            const moderateRisk = zones.filter((z: any) => z.fire_hazard_level === "Moderate").length;
            
            setStats({ totalZones, veryHighRisk, highRisk, moderateRisk });
            console.log("🎉 All zones loaded from static file:", { totalZones, veryHighRisk, highRisk, moderateRisk });
            return;
          }
        }
      } catch (staticError) {
        console.log("📁 Static file not found, falling back to database");
      }
      
      // Fallback: Load sample zones from database if static file not available
      console.log("🔄 Fallback: Loading sample zones from database...");
      const { data, error } = await supabase.rpc('get_sample_fire_zones');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const validZones = data.filter(zone => zone.geometry != null);
        setFireZones(validZones);
        
        const totalZones = validZones.length;
        const veryHighRisk = validZones.filter(z => z.fire_hazard_level === "Very High").length;
        const highRisk = validZones.filter(z => z.fire_hazard_level === "High").length;
        const moderateRisk = validZones.filter(z => z.fire_hazard_level === "Moderate").length;
        
        setStats({ totalZones, veryHighRisk, highRisk, moderateRisk });
        console.log("⚠️ Using sample data:", { totalZones, veryHighRisk, highRisk, moderateRisk });
      }
      
    } catch (err: any) {
      console.error("Error fetching fire zones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFireZoneColor = (hazardLevel: string) => {
    switch (hazardLevel) {
      case "Very High":
        return "#dc2626"; // Red
      case "High":
        return "#ea580c"; // Orange-red
      case "Moderate":
        return "#f59e0b"; // Orange
      default:
        return "#6b7280"; // Gray
    }
  };

  const getFireZoneStyle = (feature: any) => {
    const hazardLevel = feature.properties.fire_hazard_level;
    const color = getFireZoneColor(hazardLevel);
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 0.8,
      color: color,
      fillOpacity: hazardLevel === "Very High" ? 0.7 : hazardLevel === "High" ? 0.5 : 0.3,
    };
  };

  const onEachFireZone = (feature: any, layer: any) => {
    const { fire_hazard_level, data_source } = feature.properties;
    
    layer.bindPopup(`
      <div class="p-2">
        <h3 class="font-semibold text-lg mb-2">
          <span class="inline-flex items-center">
            🔥 Fire Hazard Zone
          </span>
        </h3>
        <div class="space-y-1 text-sm">
          <p><strong>Risk Level:</strong> ${fire_hazard_level}</p>
          <p><strong>Source:</strong> ${data_source}</p>
        </div>
      </div>
    `);
    
    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          weight: 3,
          fillOpacity: 0.8
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle(getFireZoneStyle(feature));
      }
    });
  };

  const shouldShowZone = (hazardLevel: string) => {
    switch (hazardLevel) {
      case "Very High":
        return layersVisible.veryHigh;
      case "High":
        return layersVisible.high;
      case "Moderate":
        return layersVisible.moderate;
      default:
        return true;
    }
  };

  const toggleLayer = (layer: 'veryHigh' | 'high' | 'moderate') => {
    setLayersVisible(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <Flame className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Map Loading Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              <MapPin className="mr-2 w-6 h-6 text-red-500" />
              California Fire Hazard Zones
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Interactive map displaying {stats.totalZones.toLocaleString()} official CAL FIRE zones
            </p>
          </div>

          {/* Layer Controls */}
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-gray-400" />
            <div className="flex space-x-1">
              <button
                onClick={() => toggleLayer('veryHigh')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  layersVisible.veryHigh
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
              >
                Very High ({stats.veryHighRisk})
              </button>
              <button
                onClick={() => toggleLayer('high')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  layersVisible.high
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
              >
                High ({stats.highRisk})
              </button>
              <button
                onClick={() => toggleLayer('moderate')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  layersVisible.moderate
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
              >
                Moderate ({stats.moderateRisk})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-50 dark:bg-gray-700 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading fire hazard zones...</p>
            </div>
          </div>
        )}
        
        <div className="h-96 lg:h-[500px] w-full">
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full rounded-b-2xl"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {fireZones
              .filter(zone => shouldShowZone(zone.fire_hazard_level))
              .map((zone) => {
                if (!zone.geometry) return null;
                
                // Parse geometry if it's a string (from RPC function)
                let geometry = zone.geometry;
                if (typeof geometry === 'string') {
                  try {
                    geometry = JSON.parse(geometry);
                  } catch (e) {
                    console.error("Failed to parse geometry for zone", zone.id);
                    return null;
                  }
                }
                
                return (
                  <GeoJSON
                    key={`${zone.id}-${layersVisible.veryHigh}-${layersVisible.high}-${layersVisible.moderate}`}
                    data={{
                      type: "Feature",
                      properties: {
                        fire_hazard_level: zone.fire_hazard_level,
                        data_source: zone.data_source,
                      },
                      geometry: geometry,
                    }}
                    style={getFireZoneStyle}
                    onEachFeature={onEachFireZone}
                  />
                );
              })}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Very High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-gray-700 dark:text-gray-300">High Risk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-gray-700 dark:text-gray-300">Moderate Risk</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Data source: CAL FIRE • Click zones for details
          </div>
        </div>
      </div>
    </div>
  );
}
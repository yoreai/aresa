"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Sample hotspot data (replace with real data from Vercel Blob)
const hotspots = [
  { name: "Downtown Pittsburgh", lat: 40.4406, lng: -79.9959, incidents: 28453 },
  { name: "Oakland", lat: 40.4388, lng: -79.9514, incidents: 24176 },
  { name: "Shadyside", lat: 40.4523, lng: -79.9311, incidents: 18932 },
  { name: "Squirrel Hill", lat: 40.4348, lng: -79.9203, incidents: 17245 },
  { name: "Bloomfield", lat: 40.4658, lng: -79.9478, incidents: 15834 },
];

export default function FireMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-700/50 rounded flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  const pittsburghCenter: LatLngExpression = [40.4406, -79.9959];

  return (
    <div className="h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={pittsburghCenter}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((spot, idx) => {
          const radius = Math.sqrt(spot.incidents) / 10;
          return (
            <CircleMarker
              key={idx}
              center={[spot.lat, spot.lng]}
              radius={radius}
              pathOptions={{
                fillColor: "#f44336",
                fillOpacity: 0.6,
                color: "#c62828",
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-gray-900">
                  <strong>{spot.name}</strong>
                  <br />
                  Incidents: {spot.incidents.toLocaleString()}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}


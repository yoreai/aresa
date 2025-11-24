"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Generate realistic heatmap data for Pittsburgh area
const generateHeatmapData = () => {
  const data: Array<{ x: number; y: number; z: number; color: string }> = [];

  // Pittsburgh hotspots with realistic density
  const hotspots = [
    { name: "Downtown", x: 50, y: 50, intensity: 100 },
    { name: "Oakland", x: 65, y: 45, intensity: 85 },
    { name: "Shadyside", x: 75, y: 55, intensity: 70 },
    { name: "Squirrel Hill", x: 80, y: 40, intensity: 65 },
    { name: "Bloomfield", x: 60, y: 60, intensity: 60 },
    { name: "Lawrenceville", x: 55, y: 70, intensity: 55 },
    { name: "South Side", x: 45, y: 35, intensity: 50 },
    { name: "North Side", x: 40, y: 60, intensity: 45 },
  ];

  hotspots.forEach(spot => {
    // Create density cloud around each hotspot
    for (let i = 0; i < 20; i++) {
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetY = (Math.random() - 0.5) * 15;
      const intensity = spot.intensity * (0.6 + Math.random() * 0.4);

      // VERY bright colors for dark theme visibility
      const color = intensity > 80 ? "#ff4444" :  // Vivid red
                   intensity > 60 ? "#ff6b6b" :  // Bright coral-red
                   intensity > 40 ? "#ff8a65" :  // Orange-coral
                   "#ffab91";                     // Light peach

      data.push({
        x: spot.x + offsetX,
        y: spot.y + offsetY,
        z: intensity,
        color,
      });
    }
  });

  return data;
};

export default function HeatmapViz() {
  const data = generateHeatmapData();

  return (
    <div className="bg-gray-800 rounded p-4">
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            stroke="#666"
            tick={{ fill: "#999" }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 100]}
            stroke="#666"
            tick={{ fill: "#999" }}
          />
          <ZAxis type="number" dataKey="z" range={[100, 1000]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "2px solid #1976d2",
              borderRadius: "8px",
              color: "#000000",
              padding: "12px",
              fontSize: "15px",
              fontWeight: "bold",
            }}
            itemStyle={{ color: "#000000", fontWeight: "bold" }}
            labelStyle={{ color: "#1976d2", fontWeight: "bold", fontSize: "15px" }}
            formatter={(value: number) => [Math.round(value as number), "Density"]}
          />
          <Scatter data={data} fill="#f44336">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.95} stroke="#fff" strokeWidth={1.5} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-gray-500 mt-2">
        Incident density across Allegheny County - darker/larger circles = higher incident rates
      </p>
    </div>
  );
}

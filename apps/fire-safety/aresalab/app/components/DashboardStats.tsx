"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Flame, MapPin, Building, AlertTriangle } from "lucide-react";

interface Stats {
  totalAddresses: number;
  highRiskAddresses: number;
  citiesCount: number;
  countiesCount: number;
  fireZonesCount: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalAddresses: 0,
    highRiskAddresses: 0,
    citiesCount: 0,
    countiesCount: 0,
    fireZonesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log("📊 Loading dashboard stats...");
        
        // Try to load from static file first
        try {
          const response = await fetch('/data/dashboard-stats.json');
          if (response.ok) {
            const staticStats = await response.json();
            console.log("✅ Loaded stats from static file:", staticStats);
            
            setStats({
              totalAddresses: staticStats.totalAddresses || 0,
              highRiskAddresses: staticStats.highRiskAddresses || 0,
              citiesCount: staticStats.citiesCount || 0,
              countiesCount: staticStats.countiesCount || 0,
              fireZonesCount: staticStats.fireZonesCount || 0,
            });
            return;
          }
        } catch (staticError) {
          console.log("📊 Static stats file not found, using database fallback");
        }

        // Fallback: Use RPC functions
        console.log("🔄 Using database RPC functions for stats...");
        const [highRiskResult, citiesResult, countiesResult] = await Promise.all([
          supabase.rpc("get_high_risk_count"),
          supabase.rpc("get_cities_count"),
          supabase.rpc("get_counties_count"),
        ]);

        // Fetch total addresses and fire zones count
        const [{ count: totalAddresses }, { count: fireZonesCount }] = await Promise.all([
          supabase.from("enriched_addresses").select("*", { count: "exact", head: true }),
          supabase.from("fire_hazard_zones").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          totalAddresses: totalAddresses || 0,
          highRiskAddresses: highRiskResult.data || 0,
          citiesCount: citiesResult.data || 0,
          countiesCount: countiesResult.data || 0,
          fireZonesCount: fireZonesCount || 0,
        });

        console.log("⚠️ Using database fallback stats");
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Addresses",
      value: stats.totalAddresses.toLocaleString(),
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "High Risk Properties",
      value: stats.highRiskAddresses.toLocaleString(),
      icon: AlertTriangle,
      color: "text-fire-high",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Cities Covered",
      value: stats.citiesCount.toLocaleString(),
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Counties Covered",
      value: stats.countiesCount.toLocaleString(),
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Fire Hazard Zones",
      value: stats.fireZonesCount.toLocaleString(),
      icon: Flame,
      color: "text-fire-moderate",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? "..." : stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

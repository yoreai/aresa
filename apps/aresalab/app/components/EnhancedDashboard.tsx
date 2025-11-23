"use client";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import {
  Flame,
  MapPin,
  Building,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  MessageCircle,
} from "lucide-react";
import { AddressTable } from "./AddressTable";
import { FireHazardMap } from "./FireHazardMap";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Stats {
  totalAddresses: number;
  highRiskAddresses: number;
  citiesCount: number;
  countiesCount: number;
  fireZonesCount: number;
}

const mockTimeSeriesData = [
  { name: "Mon", visits: 4000, pageViews: 2400, newUsers: 255 },
  { name: "Tue", visits: 3000, pageViews: 1398, newUsers: 189 },
  { name: "Wed", visits: 2000, pageViews: 9800, newUsers: 278 },
  { name: "Thu", visits: 2780, pageViews: 3908, newUsers: 189 },
  { name: "Fri", visits: 1890, pageViews: 4800, newUsers: 234 },
  { name: "Sat", visits: 2390, pageViews: 3800, newUsers: 167 },
  { name: "Sun", visits: 3490, pageViews: 4300, newUsers: 299 },
];

const mockBrowserData = [
  { name: "Chrome", value: 45, color: "#10B981" },
  { name: "Safari", value: 30, color: "#3B82F6" },
  { name: "Mozilla", value: 15, color: "#F59E0B" },
  { name: "IE", value: 10, color: "#EF4444" },
];

const mockCountryData = [
  {
    country: "United States",
    pageViews: 4500,
    device: "Desktop",
    bounceRate: 32,
  },
  { country: "Canada", pageViews: 3200, device: "Mobile", bounceRate: 28 },
  { country: "Mexico", pageViews: 2800, device: "Desktop", bounceRate: 35 },
  { country: "Brazil", pageViews: 2400, device: "Tablet", bounceRate: 40 },
  { country: "Germany", pageViews: 2100, device: "Mobile", bounceRate: 25 },
];

export function EnhancedDashboard() {
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
        // Fetch all stats using direct database calls
        const [
          { count: totalAddresses },
          { data: highRiskAddresses },
          { data: citiesCount },
          { data: countiesCount },
          { count: fireZonesCount },
        ] = await Promise.all([
          supabase
            .from("enriched_addresses")
            .select("*", { count: "exact", head: true }),
          supabase.rpc("get_high_risk_count"),
          supabase.rpc("get_cities_count"),
          supabase.rpc("get_counties_count"),
          supabase
            .from("fire_hazard_zones")
            .select("*", { count: "exact", head: true }),
        ]);

        setStats({
          totalAddresses: totalAddresses || 0,
          highRiskAddresses: highRiskAddresses || 0,
          citiesCount: citiesCount,
          countiesCount: countiesCount,
          fireZonesCount: fireZonesCount || 0,
        });
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
      color: "from-blue-600 to-blue-400",
      bgGradient: "from-blue-50 to-blue-100",
      darkBgGradient: "from-blue-900/20 to-blue-800/20",
      change: "+12.5%",
      changeType: "increase" as const,
    },
    {
      title: "High Risk Properties",
      value: stats.highRiskAddresses.toLocaleString(),
      icon: AlertTriangle,
      color: "from-red-600 to-red-400",
      bgGradient: "from-red-50 to-red-100",
      darkBgGradient: "from-red-900/20 to-red-800/20",
      change: "+8.2%",
      changeType: "increase" as const,
    },
    {
      title: "Cities Covered",
      value: stats.citiesCount.toLocaleString(),
      icon: Building,
      color: "from-green-600 to-green-400",
      bgGradient: "from-green-50 to-green-100",
      darkBgGradient: "from-green-900/20 to-green-800/20",
      change: "+15.3%",
      changeType: "increase" as const,
    },
    {
      title: "Fire Hazard Zones",
      value: stats.fireZonesCount.toLocaleString(),
      icon: Flame,
      color: "from-orange-600 to-orange-400",
      bgGradient: "from-orange-50 to-orange-100",
      darkBgGradient: "from-orange-900/20 to-orange-800/20",
      change: "+5.7%",
      changeType: "increase" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="overflow-hidden relative bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 group dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1"
          >
            {/* Gradient background overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} dark:bg-gradient-to-br dark:${stat.darkBgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="relative p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                      {stat.title}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {loading ? (
                        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                      ) : (
                        stat.value
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-500">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fire Hazard Map */}
      <FireHazardMap />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Weekly Analytics Chart */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm xl:col-span-2 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Weekly Analytics
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Address visits and page views over time
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTimeSeriesData}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorPageViews"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPageViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser Usage Chart */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Browser Usage
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Most popular browsers
              </p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={mockBrowserData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mockBrowserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {mockBrowserData.map((browser, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: browser.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {browser.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {browser.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Bounce Rate Chart */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Bounce Rate
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                32% bounce rate across all pages
              </p>
            </div>
            <div className="flex items-center px-3 py-1 space-x-2 bg-green-50 rounded-full dark:bg-green-900/20">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Low Risk
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTimeSeriesData}>
                <defs>
                  <linearGradient
                    id="bounceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#bounceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Analytics */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Audience by Country
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Geographic distribution of users
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {mockCountryData.map((country, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl transition-colors dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <span className="text-xs font-bold text-white">
                        {country.country.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {country.country}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {country.device}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {country.pageViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {country.bounceRate}% bounce
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Address Data Table */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="flex items-center text-xl font-semibold text-gray-900 dark:text-gray-100">
              <MapPin className="mr-2 w-5 h-5 text-fire-high" />
              Enriched Addresses
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Browse and filter the complete address dataset with fire risk
              metrics
            </p>
          </div>
        </div>
        <AddressTable />
      </div>
    </div>
  );
}

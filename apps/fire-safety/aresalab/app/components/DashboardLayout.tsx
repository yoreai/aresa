"use client";
import { useState } from "react";
import {
  Flame,
  MessageCircle,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Home,
  Users,
  Database,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EnhancedDashboard } from "./EnhancedDashboard";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const sidebarItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: BarChart3, label: "Analytics" },
    { icon: Database, label: "Addresses" },
    { icon: Shield, label: "Risk Analysis" },
    { icon: Users, label: "Users" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div
              className={`flex items-center transition-all duration-200 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
            >
              <div
                className={`flex items-center transition-all duration-200 ${sidebarCollapsed ? "justify-center" : "space-x-3"}`}
              >
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      BlazeBuilder
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Fire Risk Intelligence
                    </p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
            {sidebarCollapsed && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
                    sidebarCollapsed
                      ? "justify-center px-2 py-4"
                      : "space-x-3 px-3 py-3"
                  } ${
                    item.active && !sidebarCollapsed
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <item.icon
                    className={`${sidebarCollapsed ? "h-6 w-6" : "h-5 w-5"} ${
                      item.active
                        ? sidebarCollapsed
                          ? "text-orange-400"
                          : "text-white"
                        : ""
                    } ${sidebarCollapsed ? "mx-auto" : ""}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Chat Toggle */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`w-full flex items-center rounded-xl transition-all duration-200 ${
                sidebarCollapsed
                  ? "justify-center px-2 py-4"
                  : "space-x-3 px-3 py-3"
              } ${
                chatOpen && !sidebarCollapsed
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              }`}
            >
              <MessageCircle
                className={`${sidebarCollapsed ? "h-6 w-6" : "h-5 w-5"} ${
                  chatOpen
                    ? sidebarCollapsed
                      ? "text-blue-400"
                      : "text-white"
                    : ""
                } ${sidebarCollapsed ? "mx-auto" : ""}`}
              />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">AI Assistant</span>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 z-30 h-screen w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-300 ${
          chatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  AI Assistant
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Hello! I'm your AI assistant. I can help you analyze fire
                      risk data, explain metrics, and answer questions about the
                      dashboard.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Just now
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"} ${chatOpen ? "mr-80" : "mr-0"}`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Fire Risk Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Comprehensive insights across 2.3M+ addresses
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search addresses..."
                    className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <Bell className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </button>

                {/* Profile */}
                <DashboardHeader />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <EnhancedDashboard />
        </main>
      </div>

      {/* Mobile Overlay */}
      {(chatOpen || !sidebarCollapsed) && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => {
            setChatOpen(false);
            setSidebarCollapsed(true);
          }}
        />
      )}
    </div>
  );
}

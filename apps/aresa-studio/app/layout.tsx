import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Sidebar from "@/components/Sidebar";
import DemoBanner from "@/components/DemoBanner";

export const metadata: Metadata = {
  title: "ARESA Studio - Universal Database Management",
  description: "Beautiful web UI for ARESA CLI - query PostgreSQL, MySQL, BigQuery, SQLite, ClickHouse, Snowflake, Databricks from your browser",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#22d3ee' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ARESA Studio',
  },
  themeColor: '#22d3ee',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex flex-col h-screen">
            <DemoBanner />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              {/* Main Content */}
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

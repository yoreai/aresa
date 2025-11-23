import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./utils/theme-context";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "BlazeBuilder",
  description:
    "AI-powered construction intelligence platform for lead generation and environmental risk assessment. Scale your construction business 30-50% faster with advanced AI agents.",
  manifest: "/manifest.json",
  keywords: [
    "construction intelligence",
    "AI construction leads",
    "fire risk assessment",
    "construction business",
    "environmental risk",
    "construction AI",
    "property risk analysis",
  ],
  authors: [{ name: "BlazeBuilder Team" }],
  creator: "BlazeBuilder",
  publisher: "BlazeBuilder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BlazeBuilder",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blazebuilder.ai",
    title: "BlazeBuilder",
    description:
      "AI-powered construction intelligence platform for lead generation and environmental risk assessment",
    siteName: "BlazeBuilder",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "BlazeBuilder Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlazeBuilder",
    description:
      "AI-powered construction intelligence platform for lead generation and environmental risk assessment",
    images: ["/icons/icon-512x512.png"],
  },
  category: "business",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ea580c" },
    { media: "(prefers-color-scheme: dark)", color: "#ea580c" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* PWA and Theme Configuration */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ea580c" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="BlazeBuilder" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <link
            rel="apple-touch-startup-image"
            href="/icons/icon-512x512.png"
          />

          {/* Theme initialization */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                  }
                } catch (_) {}
              `,
            }}
          />

          {/* Service Worker Registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
                      .then(function(registration) {
                        console.log('[PWA] Service Worker registered successfully:', registration.scope);

                        // Force immediate updates for critical fixes
                        registration.addEventListener('updatefound', () => {
                          console.log('[PWA] New service worker available - applying immediately');
                          const newWorker = registration.installing;
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed') {
                              // Skip waiting and force immediate activation
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                              // Reload after a short delay to apply changes
                              setTimeout(() => {
                                console.log('[PWA] Reloading for auth fix');
                                window.location.reload();
                              }, 100);
                            }
                          });
                        });

                        // Check for updates every time the app is opened
                        registration.update();
                      })
                      .catch(function(error) {
                        console.log('[PWA] Service Worker registration failed:', error);
                      });
                  });
                }
              `,
            }}
          />
        </head>
        <body
          className={`${inter.className} scroll-smooth`}
          suppressHydrationWarning
        >
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

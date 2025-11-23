// BlazeBuilder PWA Service Worker
const CACHE_NAME = "blazebuilder-v1.0.5";
const STATIC_CACHE_NAME = "blazebuilder-static-v1.0.5";

// Essential files to cache for offline functionality
const STATIC_FILES = [
  "/manifest.json",
  "/favicon.svg",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  // Core CSS and JS will be cached automatically by Next.js
];

// Dynamic cache patterns - only cache publication pages (no auth needed)
const DYNAMIC_CACHE_PATTERNS = [
  /^\/publication\/[^\/]+$/,
];

// Network-first patterns (always try network first for fresh data)
const NETWORK_FIRST_PATTERNS = [/^\/api\//, /^\/sign-in/, /^\/sign-up/];

// NEVER cache these routes (always fresh for auth)
const NEVER_CACHE_PATTERNS = [
  /^\/$/, // Homepage - needs fresh auth state
  /^\/dashboard/, // Dashboard - always fresh
  /^\/research$/, // Research - needs auth check
  /^\/technology$/, // Technology - needs auth check
];

// Install event - cache essential files
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        // Force immediate activation for critical fixes
        console.log("[SW] Skipping waiting for immediate activation");
        return self.skipWaiting();
      })
  );
});

// Message handler for forced updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Received SKIP_WAITING message");
    self.skipWaiting();
  }
});

// Activate event - clean up old caches and claim clients
self.addEventListener("activate", (event) => {
  console.log(
    "[SW] Activating service worker v1.0.5 - Never cache auth routes"
  );
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim(),
    ])
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and external URLs
  if (event.request.method !== "GET" || !url.origin.includes(location.origin)) {
    return;
  }

  // NEVER cache auth-related routes (always fresh network requests)
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    console.log("[SW] Never caching auth route:", url.pathname);
    event.respondWith(fetch(event.request));
    return;
  }

  // Network first for API calls and authenticated pages
  if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Cache first for static assets and public pages
  if (DYNAMIC_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // Stale while revalidate for everything else
  event.respondWith(staleWhileRevalidateStrategy(event.request));
});

// Network first strategy - for dynamic content
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/");
    }
    throw error;
  }
}

// Cache first strategy - for static content
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[SW] Cache and network failed:", error);
    if (request.mode === "navigate") {
      return caches.match("/");
    }
    throw error;
  }
}

// Stale while revalidate strategy - balanced approach
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Always fetch from network in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.log("[SW] Background fetch failed:", error);
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Wait for network if no cached version
  return fetchPromise;
}

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log("[SW] Performing background sync");
  // Handle any queued API requests when back online
  // Implementation depends on your specific needs
}

// Push notifications (for future lead alerts)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "view",
          title: "View Lead",
          icon: "/icons/view-icon.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
          icon: "/icons/dismiss-icon.png",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification("BlazeBuilder Alert", options)
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/dashboard"));
  }
});

// Periodic background sync for lead updates
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "lead-update") {
    event.waitUntil(updateLeads());
  }
});

async function updateLeads() {
  console.log("[SW] Updating leads in background");
  // Fetch latest leads when app is in background
  // Implementation depends on your API structure
}

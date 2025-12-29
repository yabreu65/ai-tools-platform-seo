// YA Tools - Advanced Service Worker
const CACHE_NAME = 'ya-tools-v1.0.0';
const STATIC_CACHE = 'ya-tools-static-v1.0.0';
const DYNAMIC_CACHE = 'ya-tools-dynamic-v1.0.0';
const API_CACHE = 'ya-tools-api-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/_next/static/css/app/layout.css',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/tools',
  '/api/analytics',
  '/api/feedback',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log('Service Worker: Preparing API cache');
        return Promise.resolve();
      }),
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE &&
            cacheName.startsWith('ya-tools-')
          ) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - Cache first
    event.respondWith(handleStaticAssets(request));
  } else if (url.pathname.match(/\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    // Static resources - Cache first
    event.respondWith(handleStaticAssets(request));
  } else {
    // HTML pages - Stale while revalidate
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'No network connection available',
        cached: false,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle page requests with stale-while-revalidate strategy
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    networkResponsePromise.catch(() => {});
    return cachedResponse;
  }
  
  // Wait for network if no cache
  try {
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    console.log('Service Worker: Network failed for page request');
  }
  
  // Fallback to offline page
  const offlineResponse = await caches.match('/offline');
  if (offlineResponse) {
    return offlineResponse;
  }
  
  return new Response('Page not available offline', { status: 404 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === 'background-sync-feedback') {
    event.waitUntil(syncFeedback());
  }
});

// Sync analytics data when back online
async function syncAnalytics() {
  try {
    const cache = await caches.open('offline-analytics');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        const data = await response.json();
        
        // Send to analytics endpoint
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        // Remove from cache after successful sync
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync analytics:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync feedback data when back online
async function syncFeedback() {
  try {
    const cache = await caches.open('offline-feedback');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        const data = await response.json();
        
        // Send to feedback endpoint
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        // Remove from cache after successful sync
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync feedback:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'Nueva actualización disponible en YA Tools',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver actualización',
        icon: '/icon-explore.png',
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-close.png',
      },
    ],
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('YA Tools', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  } else if (event.data && event.data.type === 'CACHE_ANALYTICS') {
    cacheOfflineData('offline-analytics', event.data.payload);
  } else if (event.data && event.data.type === 'CACHE_FEEDBACK') {
    cacheOfflineData('offline-feedback', event.data.payload);
  }
});

// Cache offline data for background sync
async function cacheOfflineData(cacheName, data) {
  try {
    const cache = await caches.open(cacheName);
    const request = new Request(`/offline-${cacheName}-${Date.now()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    await cache.put(request, response);
    console.log('Service Worker: Offline data cached for sync');
  } catch (error) {
    console.error('Failed to cache offline data:', error);
  }
}
# Service Workers

## Registration

```tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      console.log('SW registered:', registration.scope)
    } catch (err) {
      console.error('SW registration failed:', err)
    }
  })
}
```

## Lifecycle Events

### install

```tsx
// sw.ts
const CACHE_NAME = 'app-v1'
const PRECACHE_URLS = ['/', '/index.html', '/assets/app.js', '/assets/app.css']

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  // Skip waiting to activate immediately (instead of waiting for old SW to release)
  self.skipWaiting()
})
```

### activate

```tsx
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  )
  // Take control of all open tabs immediately
  self.clients.claim()
})
```

### fetch

```tsx
self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    }),
  )
})
```

**Note:** If `respondWith()` is not called, the request goes to the network normally.

## Workbox Setup

### Installation

```bash
npm install workbox-core workbox-routing workbox-strategies workbox-precaching workbox-expiration workbox-background-sync
```

### generateSW vs injectManifest

| Feature | generateSW | injectManifest |
|---------|-----------|---------------|
| Simplicity | Config only — no SW code | Write custom SW code |
| Custom logic | Limited to config options | Full freedom |
| Push / Sync | Not supported | Supported |
| When to use | Simple caching needs | Complex apps, push, offline |

### injectManifest Service Worker

```tsx
// sw.ts
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// Precache build assets (injected by build tool)
precacheAndRoute(self.__WB_MANIFEST)
```

## Cache Strategies (with Workbox)

### Cache First — Static Assets

```tsx
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
)
```

**Use for:** Images, fonts, static JS/CSS with content hashes. Serve from cache, never hit network after first fetch.

### Network First — API Data

```tsx
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3, // Fall back to cache after 3s
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  }),
)
```

**Use for:** API responses, HTML pages. Always try network first for freshness, fall back to cache if offline.

### Stale While Revalidate — Non-Critical

```tsx
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/suggestions'),
  new StaleWhileRevalidate({
    cacheName: 'suggestions',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 }),
    ],
  }),
)
```

**Use for:** Avatars, non-critical API data. Return cache immediately, update cache in background.

### Network Only — Sensitive Endpoints

```tsx
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth/'),
  new NetworkOnly(),
)
```

**Use for:** Auth endpoints, payment APIs. Never cache sensitive data.

### Offline Fallback for Navigation

```tsx
import { setCatchHandler } from 'workbox-routing'

// Precache the offline page
precacheAndRoute([{ url: '/offline.html', revision: '1' }])

// Serve offline page when navigation fails
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html')!
  }
  return Response.error()
})
```

## Push Notifications

### 1. Generate VAPID Keys (One-Time, Server)

```bash
npx web-push generate-vapid-keys
```

### 2. Client: Subscribe

```tsx
async function subscribeToPush(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready

  // Check permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  // Send subscription to server for storage
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  return subscription
}

// Helper: convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}
```

### 3. Server: Send Push

```tsx
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

async function sendPushNotification(subscription: PushSubscription, payload: object) {
  await webpush.sendNotification(subscription, JSON.stringify(payload))
}

// Usage
await sendPushNotification(userSubscription, {
  title: 'New Message',
  body: 'You have a new notification',
  icon: '/icon-192.png',
  url: '/notifications',
})
```

### 4. Service Worker: Handle Push

```tsx
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? { title: 'Notification', body: '' }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/icon-192.png',
      badge: '/badge-72.png',
      data: { url: data.url ?? '/' },
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    }),
  )
})
```

### 5. Handle Notification Click

```tsx
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if open
      for (const client of clients) {
        if (new URL(client.url).pathname === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new tab
      return self.clients.openWindow(url)
    }),
  )
})
```

## Background Sync

### Register Sync (Main Thread)

```tsx
async function saveOffline(data: unknown) {
  // Store in IndexedDB
  await db.syncQueue.add({
    url: '/api/posts',
    method: 'POST',
    body: data,
    timestamp: Date.now(),
  })

  // Register sync event
  const registration = await navigator.serviceWorker.ready
  await registration.sync.register('sync-posts')
}
```

### Handle Sync (Service Worker)

```tsx
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(replayPendingRequests())
  }
})

async function replayPendingRequests() {
  const pending = await db.syncQueue.toArray()
  for (const item of pending) {
    const response = await fetch(item.url, {
      method: item.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.body),
    })
    if (response.ok) {
      await db.syncQueue.delete(item.id)
    } else {
      throw new Error('Sync failed') // Retry on next sync event
    }
  }
}
```

### Workbox BackgroundSyncPlugin (Simpler)

```tsx
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
})

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST',
)
```

## Service Worker Update Flow

### Detect Updates (Main Thread)

```tsx
const registration = await navigator.serviceWorker.register('/sw.js')

registration.addEventListener('updatefound', () => {
  const newWorker = registration.installing!

  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      // New SW is waiting — show update UI
      showUpdateBanner()
    }
  })
})
```

### Apply Update

```tsx
function applyUpdate() {
  navigator.serviceWorker.getRegistration().then((reg) => {
    reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  })

  // Reload when new SW takes over
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })
}
```

### Handle in Service Worker

```tsx
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
```

## Debugging

### Chrome DevTools
- **Application > Service Workers** — see registered SW, update, unregister
- **Application > Cache Storage** — inspect cached resources
- **Network tab** — "from ServiceWorker" shows intercepted requests
- **Check "Update on reload"** during development

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| SW serves stale HTML | CacheFirst for navigation | Use NetworkFirst for HTML/navigation |
| SW won't update | Browser caches sw.js | Set `Cache-Control: no-cache` for sw.js on server |
| Push not working | VAPID mismatch | Ensure public key matches private key |
| Precache fails | Asset URL changed | Rebuild with new manifest |
| Fetch handler not firing | Scope mismatch | Check `registration.scope` matches your routes |

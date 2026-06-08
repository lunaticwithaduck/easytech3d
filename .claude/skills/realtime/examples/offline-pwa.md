# Example: Offline PWA with Workbox

Complete Progressive Web App setup using Workbox injectManifest: precaching + runtime caching split, background sync for offline form submissions, push notifications, service worker update banner, and web app manifest.

## Web App Manifest

```json
// public/manifest.json
{
  "name": "My PWA App",
  "short_name": "MyPWA",
  "description": "An offline-capable progressive web app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## Service Worker (Workbox injectManifest)

```tsx
// src/sw.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

declare let self: ServiceWorkerGlobalScope

// ─── Precaching ───────────────────────────────────────────────
// __WB_MANIFEST is replaced at build time with the list of build assets
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ─── Runtime Caching ──────────────────────────────────────────

// Static assets (images, fonts) — Cache First
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
)

// CSS & JS not in precache (third-party) — Stale While Revalidate
registerRoute(
  ({ request }) =>
    request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  }),
)

// API GET requests — Network First with 3s timeout
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
    ],
  }),
)

// API mutations (POST/PUT/DELETE) — Network Only with Background Sync
const bgSyncPlugin = new BackgroundSyncPlugin('api-mutation-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
})

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method),
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST',
)
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') && ['PUT', 'PATCH', 'DELETE'].includes(request.method),
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'PUT',
)
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') && request.method === 'DELETE',
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'DELETE',
)

// Auth endpoints — Network Only, never cached
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth/'),
  new NetworkOnly(),
)

// ─── Offline Fallback ─────────────────────────────────────────
// Precache the offline page
precacheAndRoute([{ url: '/offline.html', revision: '1' }])

setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    const cache = await caches.open('workbox-precache-v2')
    return (await cache.match('/offline.html')) ?? Response.error()
  }
  return Response.error()
})

// ─── Push Notifications ───────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Notification', body: '' }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: data.tag ?? 'default',
      data: { url: data.url ?? '/' },
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (new URL(client.url).pathname === url && 'focus' in client) {
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      }),
  )
})

// ─── SW Update ────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
```

## SW Registration & Update Detection

```tsx
// lib/sw-registration.ts

type UpdateCallback = () => void

export async function registerSW(onUpdate?: UpdateCallback): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

    // Check for updates periodically (every 60 minutes)
    setInterval(() => registration.update(), 60 * 60 * 1000)

    // Detect new SW waiting
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version is waiting — notify UI
          onUpdate?.()
        }
      })
    })

    // Reload when new SW takes control
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    return registration
  } catch (error) {
    console.error('SW registration failed:', error)
    return null
  }
}

export function applyUpdate() {
  navigator.serviceWorker.getRegistration().then((reg) => {
    reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  })
}
```

## Push Notification Subscription

```tsx
// lib/push.ts

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })

  return subscription
}

export async function unsubscribeFromPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
    await subscription.unsubscribe()
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}
```

## React Components

### Update Banner

```tsx
// components/UpdateBanner.tsx
'use client'

import { useEffect, useState } from 'react'
import { registerSW, applyUpdate } from '@/lib/sw-registration'

export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    registerSW(() => setShowUpdate(true))
  }, [])

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-lg">
      <p className="text-sm">A new version is available.</p>
      <button
        onClick={() => {
          applyUpdate()
          setShowUpdate(false)
        }}
        className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
      >
        Update now
      </button>
      <button
        onClick={() => setShowUpdate(false)}
        className="text-sm text-muted-foreground hover:underline"
      >
        Later
      </button>
    </div>
  )
}
```

### Push Notification Toggle

```tsx
// components/PushToggle.tsx
'use client'

import { useState, useEffect } from 'react'
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push'

export function PushToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    if (supported) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub)
        })
      })
    }
  }, [])

  const toggle = async () => {
    setIsLoading(true)
    try {
      if (isSubscribed) {
        await unsubscribeFromPush()
        setIsSubscribed(false)
      } else {
        const sub = await subscribeToPush()
        setIsSubscribed(!!sub)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) return null

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
    >
      <span className={`h-2 w-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-muted-foreground'}`} />
      {isLoading ? 'Processing...' : isSubscribed ? 'Notifications on' : 'Enable notifications'}
    </button>
  )
}
```

### Offline Indicator

```tsx
// components/OfflineIndicator.tsx
'use client'

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true // Assume online during SSR
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 z-50 w-full bg-yellow-500 px-4 py-1.5 text-center text-sm font-medium text-yellow-950">
      You are offline. Changes will sync when you reconnect.
    </div>
  )
}
```

## Offline Page

```html
<!-- public/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Offline — MyPWA</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8fafc;
      color: #0f172a;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #64748b; margin-bottom: 1.5rem; }
    button {
      background: #0f172a;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're offline</h1>
    <p>Check your internet connection and try again.</p>
    <button onclick="window.location.reload()">Retry</button>
  </div>
</body>
</html>
```

## Build Configuration (Vite + workbox-build)

```tsx
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

```tsx
// scripts/build-sw.ts — run after vite build
import { injectManifest } from 'workbox-build'

async function buildSW() {
  const { count, size } = await injectManifest({
    swSrc: 'src/sw.ts',
    swDest: 'dist/sw.js',
    globDirectory: 'dist',
    globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  })
  console.log(`Precached ${count} files (${(size / 1024).toFixed(1)} KB)`)
}

buildSW()
```

```json
// package.json (scripts)
{
  "scripts": {
    "build": "vite build && tsx scripts/build-sw.ts",
    "dev": "vite"
  }
}
```

## Key Patterns

1. **Precache + runtime split** — Build assets use `precacheAndRoute(self.__WB_MANIFEST)` for versioned offline caching. Runtime requests use strategy-based routing (CacheFirst for images, NetworkFirst for API).
2. **BackgroundSyncPlugin for mutations** — POST/PUT/DELETE requests that fail offline are queued by Workbox and replayed when connectivity returns, with up to 24h retention.
3. **Offline fallback** — `setCatchHandler` serves `/offline.html` when navigation requests fail and no cached response exists.
4. **SW update flow** — `updatefound` event detects a new SW waiting, UI shows a banner, user clicks "Update", `SKIP_WAITING` message activates the new SW, `controllerchange` triggers reload.
5. **useSyncExternalStore for online status** — React 18 hook correctly subscribes to browser `online`/`offline` events with SSR-safe `getServerSnapshot`.
6. **injectManifest build step** — `workbox-build` scans the dist directory and injects the precache manifest into the compiled SW file, ensuring all build assets are cached with correct revision hashes.
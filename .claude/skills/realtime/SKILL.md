---
name: realtime
description: >
  This skill should be used when the user asks about "WebSockets", "socket.io",
  "Socket.IO", "Server-Sent Events", "SSE", "EventSource", "long polling",
  "real-time updates", "live data", "Web Workers", "SharedWorker", "Comlink",
  "transferable objects", "off-main-thread", "Service Worker", "offline support",
  "push notifications", "background sync", "precaching", "Workbox", "PWA",
  "Progressive Web App", or needs to choose between real-time transport strategies
  or background processing patterns.
keywords:
  - WebSocket
  - socket.io
  - Socket.IO
  - Server-Sent Events
  - SSE
  - EventSource
  - long polling
  - real-time
  - live data
  - Web Worker
  - SharedWorker
  - Comlink
  - transferable objects
  - postMessage
  - Service Worker
  - offline
  - push notification
  - background sync
  - precaching
  - Workbox
  - PWA
  - Progressive Web App
---

# Realtime — Communication, Workers & Offline

Real-time transport protocols (WebSocket, SSE, polling), off-main-thread processing (Web Workers, Comlink), and offline-capable applications (Service Workers, Workbox, PWA). For basic Worker/SW snippets, see `~/.claude/skills/frontend/references/performance-guide.md`.

## Real-Time Transport Decision Tree

```
Need real-time data from server?
├── Server pushes data continuously (feeds, scores, notifications)?
│   ├── Need bidirectional communication (chat, collab editing)?
│   │   └── WebSocket (native API or socket.io)
│   └── Server → client only, unidirectional?
│       └── Server-Sent Events (SSE) — simpler, auto-reconnect
│
├── Occasional updates, client initiates most requests?
│   ├── Updates every 5-30s acceptable?
│   │   └── Polling with TanStack Query refetchInterval (simplest)
│   └── Need near-instant but WS/SSE unavailable?
│       └── Long polling (fallback only)
│
├── Using socket.io?
│   ├── Need automatic transport fallback (WS → HTTP polling)?
│   │   └── socket.io handles this transparently
│   └── Only need WebSocket, no fallback?
│       └── Native WebSocket API (zero dependencies)
│
└── Fire-and-forget background sync (user went offline)?
    └── Service Worker Background Sync API
```

## Transport Comparison

| Transport | Direction | Connection | Reconnect | Overhead | Use Case |
|-----------|----------|-----------|----------|---------|----------|
| WebSocket | Bidirectional | Persistent | Manual | Low (frames) | Chat, games, collab editing |
| SSE | Server → Client | Persistent | Automatic | Low (HTTP) | Live feeds, notifications, dashboards |
| Long Polling | Bidirectional | Per-request | Per-request | High | Legacy fallback |
| socket.io | Bidirectional | Persistent | Automatic | Medium | When transport fallback matters |
| Polling (fetch) | Client → Server | None | N/A | Variable | Simple dashboards, 5s+ intervals |

## WebSocket Quick Pattern

```tsx
function useWebSocket(url: string) {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(url)
      wsRef.current = ws
      ws.onopen = () => { setStatus('open'); retriesRef.current = 0 }
      ws.onclose = () => {
        setStatus('closed')
        const delay = Math.min(1000 * 2 ** retriesRef.current, 30000)
        retriesRef.current++
        setTimeout(connect, delay) // exponential backoff reconnect
      }
      ws.onmessage = (e) => { /* handle e.data */ }
    }
    connect()
    return () => { wsRef.current?.close() }
  }, [url])

  const send = useCallback((data: string) => wsRef.current?.send(data), [])
  return { status, send }
}
```

## SSE Quick Pattern

```tsx
useEffect(() => {
  const source = new EventSource('/api/events')
  source.onmessage = (e) => setMessages(prev => [...prev, JSON.parse(e.data)])
  source.addEventListener('notification', (e) => showToast(JSON.parse(e.data)))
  source.onerror = () => { /* auto-reconnects by default */ }
  return () => source.close()
}, [])
```

## Worker Decision Tree

```
Need to run code off the main thread?
├── Heavy computation (parsing, encoding, image processing)?
│   ├── Simple fire-and-forget → Dedicated Web Worker
│   └── Want type-safe async API → Comlink (wraps Worker with Proxy)
│
├── Shared state across multiple tabs/windows?
│   └── SharedWorker (one instance per origin, multiple ports)
│
├── Passing large binary data (ArrayBuffer, images)?
│   └── Use transferable objects (zero-copy, not structured clone)
│
└── Need to intercept network requests, cache, offline?
    └── Service Worker (separate lifecycle, not a compute worker)
```

## Comlink Quick Pattern

```tsx
// worker.ts
import { expose } from 'comlink'

const api = {
  async processData(items: number[]): Promise<number[]> {
    return items.map(x => /* heavy computation */ x * x)
  },
}
export type WorkerAPI = typeof api
expose(api)

// main.tsx
import { wrap } from 'comlink'
import type { WorkerAPI } from './worker'

const worker = wrap<WorkerAPI>(new Worker(new URL('./worker.ts', import.meta.url)))
const result = await worker.processData([1, 2, 3]) // typed, async
```

## Service Worker Lifecycle

| Event | When | Common Use |
|-------|------|-----------|
| `install` | First registration or new SW detected | Precache critical assets |
| `activate` | After install, old SW released | Clean up old caches |
| `fetch` | Every network request from controlled pages | Cache strategies |
| `push` | Push message received from server | Show notification |
| `sync` | Network restored (after Background Sync registration) | Retry failed requests |
| `message` | `postMessage` from controlled page | On-demand cache updates |
| `notificationclick` | User clicks a push notification | Open/focus relevant tab |

## Cache Strategy Quick Reference

| Strategy | When | Freshness | Offline |
|----------|------|----------|---------|
| Cache First | Static assets, fonts, images | Stale until cache expires | Yes |
| Network First | API data that must be fresh | Fresh when online | Yes (cached fallback) |
| Stale While Revalidate | Non-critical API, avatars | Slightly stale | Yes |
| Network Only | Auth endpoints, payments | Always fresh | No |
| Cache Only | Precached app shell | Fixed version | Yes |

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| No reconnect logic on WebSocket close | Connection drops silently, app stops updating | Implement exponential backoff reconnect |
| SSE over HTTP/1.1 with many connections | Browser 6-connection limit per domain blocks other requests | Use HTTP/2 (multiplexed) or limit SSE connections |
| Posting large objects to Worker (not transferring) | Slow serialization, main thread jank | Use `postMessage(data, [data.buffer])` for zero-copy transfer |
| Missing `skipWaiting()` + `clientsClaim()` | New SW sits in waiting state, old code serves forever | Call both in install/activate (or prompt user to refresh) |
| SharedWorker port leak | Worker stays alive after tabs close | Call `port.close()` on beforeunload |
| Push notification without VAPID keys | Subscription fails silently | Generate VAPID keys, pass `applicationServerKey` to subscribe |
| Service Worker caches `index.html` as immutable | Users never get updates | Use Network First or Stale While Revalidate for HTML |

## References

- `~/.claude/skills/realtime/references/websockets.md` — Native WebSocket API, reconnection, socket.io, React hooks, typed messages
- `~/.claude/skills/realtime/references/sse-polling.md` — Server-Sent Events, long polling, Next.js streaming, managed polling
- `~/.claude/skills/realtime/references/web-workers.md` — Dedicated/Shared Workers, Comlink, transferable objects, bundling
- `~/.claude/skills/realtime/references/service-workers.md` — Full lifecycle, Workbox, push notifications, background sync, offline
- `~/.claude/skills/realtime/examples/websocket-chat.md` — WebSocket chat with reconnect and typed protocol
- `~/.claude/skills/realtime/examples/comlink-worker.md` — Off-main-thread processing with Comlink
- `~/.claude/skills/realtime/examples/offline-pwa.md` — Offline-first PWA with Service Worker
- `~/.claude/skills/frontend/references/performance-guide.md` — Basic Worker/SW snippets (existing, cross-reference)
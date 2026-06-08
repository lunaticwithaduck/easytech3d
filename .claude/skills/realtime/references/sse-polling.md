# Server-Sent Events & Polling

## Server-Sent Events (SSE)

### EventSource API (Client)

```tsx
const source = new EventSource('/api/events')

// Default 'message' event
source.onmessage = (e: MessageEvent) => {
  const data = JSON.parse(e.data)
  console.log('Message:', data)
}

// Named events
source.addEventListener('notification', (e: MessageEvent) => {
  const notification = JSON.parse(e.data)
  showToast(notification)
})

source.addEventListener('heartbeat', () => {
  // Keep-alive, no action needed
})

// Connection state
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
console.log('State:', source.readyState)

// Error handling — auto-reconnects by default
source.onerror = () => {
  if (source.readyState === EventSource.CLOSED) {
    console.log('Server closed connection permanently')
  } else {
    console.log('Connection lost, auto-reconnecting...')
  }
}

// Manual close
source.close()
```

### SSE Protocol Format

```
event: notification
data: {"title":"New message","body":"Hello world"}
id: 42
retry: 5000

data: plain message without named event type
data: this goes to the default onmessage handler

event: heartbeat
data: ping

```

| Field | Purpose |
|-------|---------|
| `data:` | Message payload (can span multiple `data:` lines, joined with `\n`) |
| `event:` | Named event type (default is `message` if omitted) |
| `id:` | Event ID for `Last-Event-ID` reconnection |
| `retry:` | Reconnect interval in ms (browser stores this) |
| Empty line | Terminates the event (dispatch to handler) |

### Last-Event-ID (Automatic Resume)

When the browser reconnects, it sends the `Last-Event-ID` header:

```
GET /api/events HTTP/1.1
Last-Event-ID: 42
```

The server can use this to resume from where the client left off, preventing missed events during brief disconnects.

### SSE with Authentication

EventSource **does not support custom headers**. Workarounds:

1. **Cookie-based auth** (automatic, preferred):
   ```tsx
   // If session cookie is set, EventSource sends it automatically
   const source = new EventSource('/api/events')
   ```

2. **URL token** (less secure):
   ```tsx
   const source = new EventSource(`/api/events?token=${jwt}`)
   ```

3. **Fetch-based SSE** (full header control, see below)

### Fetch-Based SSE (Custom Headers)

```tsx
async function fetchSSE(
  url: string,
  headers: Record<string, string>,
  onMessage: (event: string, data: string) => void,
  signal?: AbortSignal,
) {
  const response = await fetch(url, { headers, signal })
  if (!response.ok) throw new Error(`SSE failed: ${response.status}`)

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop()! // Last element is incomplete

    for (const raw of events) {
      let eventType = 'message'
      let data = ''
      for (const line of raw.split('\n')) {
        if (line.startsWith('event: ')) eventType = line.slice(7)
        else if (line.startsWith('data: ')) data += (data ? '\n' : '') + line.slice(6)
      }
      if (data) onMessage(eventType, data)
    }
  }
}

// Usage with auth header
const controller = new AbortController()
fetchSSE(
  '/api/events',
  { Authorization: `Bearer ${token}` },
  (event, data) => {
    if (event === 'notification') showToast(JSON.parse(data))
  },
  controller.signal,
)
// Cancel: controller.abort()
```

## SSE Server Implementation

### Express / Node.js

```tsx
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  // Resume from last event
  const lastId = parseInt(req.headers['last-event-id'] ?? '0', 10)

  let eventId = lastId
  const send = (event: string, data: unknown) => {
    eventId++
    res.write(`id: ${eventId}\n`)
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Send missed events if resuming
  if (lastId > 0) {
    getEventsSince(lastId).forEach(e => send(e.type, e.data))
  }

  // Heartbeat to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    res.write('event: heartbeat\ndata: ping\n\n')
  }, 30000)

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat)
  })
})
```

### Next.js Route Handler (App Router)

```tsx
// app/api/events/route.ts
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let eventId = 0

      const send = (event: string, data: unknown) => {
        eventId++
        controller.enqueue(encoder.encode(`id: ${eventId}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial data
      send('connected', { status: 'ok' })

      // Heartbeat
      const heartbeat = setInterval(() => {
        send('heartbeat', 'ping')
      }, 30000)

      // Example: subscribe to events
      const unsubscribe = eventBus.subscribe((event) => {
        send(event.type, event.data)
      })

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

## SSE vs WebSocket

| Factor | SSE | WebSocket |
|--------|-----|-----------|
| Direction | Server → Client only | Bidirectional |
| Protocol | Standard HTTP | WS protocol (upgrade) |
| Reconnection | Automatic with Last-Event-ID | Manual implementation |
| Binary data | No (text only) | Yes (ArrayBuffer, Blob) |
| Connection limit | 6 per domain (HTTP/1.1) | No browser limit |
| HTTP/2 | Multiplexed (no limit) | Separate connection |
| Proxy/CDN support | Excellent (standard HTTP) | May need configuration |
| Authentication | Cookies or fetch workaround | URL params or ticket |
| Best for | Live feeds, notifications, dashboards | Chat, games, collab editing |
| Complexity | Simple (built-in reconnect) | More complex (manual reconnect) |

**Choose SSE when:**
- Data flows server → client only
- Using HTTP/2 (no connection limit)
- Want automatic reconnection and resume

**Choose WebSocket when:**
- Need bidirectional communication
- Need binary data
- Low latency is critical (gaming, collab)

## Long Polling

```tsx
async function longPoll(
  url: string,
  onMessage: (data: unknown) => void,
  signal?: AbortSignal,
) {
  while (!signal?.aborted) {
    try {
      const response = await fetch(url, {
        signal: signal ?? AbortSignal.timeout(30000),
      })

      if (response.ok) {
        const data = await response.json()
        onMessage(data)
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') break
      if (e instanceof DOMException && e.name === 'TimeoutError') continue // Normal — server had no data
      await new Promise((r) => setTimeout(r, 2000)) // Error backoff
    }
  }
}

// Usage
const controller = new AbortController()
longPoll('/api/poll', (data) => console.log(data), controller.signal)
// Stop: controller.abort()
```

**When to use long polling:**
- WebSocket and SSE are blocked by infrastructure
- Legacy environment (extremely old proxies)
- Generally avoid — prefer SSE or WebSocket

## Managed Polling with TanStack Query

```tsx
import { useQuery } from '@tanstack/react-query'

function LiveDashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => fetch('/api/stats').then((r) => r.json()),
    refetchInterval: 5000,                  // Poll every 5s
    refetchIntervalInBackground: false,     // Pause when tab is hidden
  })

  return <StatsDisplay stats={data} />
}
```

Benefits over manual polling: automatic cache, deduplication, background refetch, error retry, devtools visibility. See `~/.claude/skills/react/references/state-management.md` for TanStack Query patterns.

## React Hook for SSE

```tsx
function useSSE<T>(url: string, eventName = 'message') {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting')

  useEffect(() => {
    const source = new EventSource(url)

    source.addEventListener('open', () => setStatus('open'))

    source.addEventListener(eventName, (e: MessageEvent) => {
      try {
        setData(JSON.parse(e.data) as T)
        setError(null)
      } catch (err) {
        setError(err as Error)
      }
    })

    source.addEventListener('error', () => {
      if (source.readyState === EventSource.CLOSED) {
        setStatus('closed')
      }
    })

    return () => source.close()
  }, [url, eventName])

  return { data, error, status }
}

// Usage
function LiveNotifications() {
  const { data, status } = useSSE<Notification>('/api/events', 'notification')
  // data updates reactively when server sends events
}
```
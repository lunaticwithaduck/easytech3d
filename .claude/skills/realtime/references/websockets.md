# WebSockets

## Native WebSocket API

### Connection Lifecycle

```tsx
const ws = new WebSocket('wss://api.example.com/ws')

ws.onopen = () => {
  console.log('Connected')
  ws.send(JSON.stringify({ type: 'hello' }))
}

ws.onmessage = (event: MessageEvent) => {
  const data = JSON.parse(event.data)
  console.log('Received:', data)
}

ws.onerror = (event: Event) => {
  console.error('WebSocket error:', event)
}

ws.onclose = (event: CloseEvent) => {
  console.log(`Closed: code=${event.code} reason=${event.reason} clean=${event.wasClean}`)
}

// Close connection
ws.close(1000, 'Normal closure')
```

### readyState

| Value | Constant | Meaning |
|-------|----------|---------|
| 0 | `WebSocket.CONNECTING` | Connection in progress |
| 1 | `WebSocket.OPEN` | Connected, ready to send |
| 2 | `WebSocket.CLOSING` | Close in progress |
| 3 | `WebSocket.CLOSED` | Connection closed |

### Binary Data

```tsx
// Send binary
ws.send(new ArrayBuffer(1024))
ws.send(new Blob(['binary data']))

// Receive binary — set before connection
ws.binaryType = 'arraybuffer' // or 'blob'
ws.onmessage = (e: MessageEvent<ArrayBuffer>) => {
  const view = new Uint8Array(e.data)
}
```

## Reconnection with Exponential Backoff

```tsx
function createReconnectingWebSocket(url: string, maxRetries = Infinity) {
  let ws: WebSocket | null = null
  let retryCount = 0
  let shouldReconnect = true
  let reconnectTimeout: ReturnType<typeof setTimeout>

  function connect() {
    ws = new WebSocket(url)

    ws.onopen = () => {
      retryCount = 0 // Reset on successful connection
    }

    ws.onclose = (event) => {
      if (!shouldReconnect || retryCount >= maxRetries) return

      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * 2 ** retryCount, 30000)
      const jitter = baseDelay * 0.2 * Math.random()
      const delay = baseDelay + jitter

      retryCount++
      reconnectTimeout = setTimeout(connect, delay)
    }

    ws.onerror = () => {} // onclose fires after onerror
  }

  function disconnect() {
    shouldReconnect = false
    clearTimeout(reconnectTimeout)
    ws?.close(1000, 'Manual disconnect')
  }

  connect()
  return { getSocket: () => ws, disconnect }
}
```

## Heartbeat / Ping-Pong

```tsx
function startHeartbeat(ws: WebSocket, intervalMs = 30000, timeoutMs = 5000) {
  let pingTimeout: ReturnType<typeof setTimeout>

  const interval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: 'ping' }))

    // If no pong within timeout, connection is dead
    pingTimeout = setTimeout(() => {
      ws.close(4000, 'Heartbeat timeout')
    }, timeoutMs)
  }, intervalMs)

  // Clear timeout when pong received (handle in onmessage)
  const handlePong = () => clearTimeout(pingTimeout)

  return {
    handlePong,
    stop: () => {
      clearInterval(interval)
      clearTimeout(pingTimeout)
    },
  }
}
```

## Typed Message Protocol

```tsx
// types.ts — shared between client and server
type ClientMessage =
  | { type: 'chat'; payload: { text: string; roomId: string } }
  | { type: 'typing'; payload: { roomId: string } }
  | { type: 'join'; payload: { roomId: string } }
  | { type: 'leave'; payload: { roomId: string } }
  | { type: 'ping' }

type ServerMessage =
  | { type: 'chat'; payload: { text: string; userId: string; timestamp: number } }
  | { type: 'presence'; payload: { userId: string; status: 'online' | 'offline' } }
  | { type: 'typing'; payload: { userId: string; roomId: string } }
  | { type: 'history'; payload: { messages: Array<{ text: string; userId: string; timestamp: number }> } }
  | { type: 'error'; payload: { code: string; message: string } }
  | { type: 'pong' }

function sendTyped(ws: WebSocket, msg: ClientMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

function parseMessage(data: string): ServerMessage | null {
  try {
    return JSON.parse(data) as ServerMessage
  } catch {
    return null
  }
}
```

## socket.io

### Server Setup

```tsx
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
})

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  try {
    const user = verifyToken(token)
    socket.data.user = user
    next()
  } catch {
    next(new Error('Authentication failed'))
  }
})

io.on('connection', (socket) => {
  console.log(`${socket.data.user.name} connected`)

  // Rooms
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId)
    io.to(roomId).emit('user-joined', { userId: socket.data.user.id })
  })

  // Messages
  socket.on('chat', (data: { roomId: string; text: string }) => {
    io.to(data.roomId).emit('chat', {
      text: data.text,
      userId: socket.data.user.id,
      timestamp: Date.now(),
    })
  })

  // Acknowledgment
  socket.on('save-draft', (data, callback) => {
    saveDraft(data).then(() => callback({ status: 'ok' }))
  })

  socket.on('disconnect', () => {
    console.log(`${socket.data.user.name} disconnected`)
  })
})

httpServer.listen(3001)
```

### Client Setup

```tsx
import { io, type Socket } from 'socket.io-client'

const socket: Socket = io('http://localhost:3001', {
  auth: { token: getAuthToken() },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

socket.on('connect', () => console.log('Connected:', socket.id))
socket.on('connect_error', (err) => console.error('Connection error:', err.message))

socket.emit('join-room', 'room-1')
socket.on('chat', (data) => { /* handle incoming chat */ })

// Emit with acknowledgment
socket.emit('save-draft', draftData, (response) => {
  console.log('Draft saved:', response.status)
})

socket.disconnect()
```

### socket.io vs Native WebSocket

| Feature | Native WebSocket | socket.io |
|---------|-----------------|-----------|
| Transport | WebSocket only | WS + HTTP long-polling fallback |
| Reconnection | Manual implementation | Automatic (configurable) |
| Rooms / Namespaces | Manual | Built-in |
| Binary support | Yes | Yes (auto-detection) |
| Acknowledgments | Manual | Built-in callback |
| Broadcasting | Manual | `io.to(room).emit()` |
| Bundle size | 0 (native) | ~30KB (client) |
| Protocol | Standard WS | Custom (not compatible with plain WS) |

## React Hook (useWebSocket)

```tsx
import { useEffect, useRef, useState, useCallback } from 'react'

type ConnectionStatus = 'connecting' | 'open' | 'closed'

interface UseWebSocketOptions<T> {
  url: string
  onMessage?: (message: T) => void
  maxRetries?: number
  heartbeatInterval?: number
}

function useWebSocket<TSend, TReceive>({
  url,
  onMessage,
  maxRetries = Infinity,
  heartbeatInterval = 30000,
}: UseWebSocketOptions<TReceive>) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [lastMessage, setLastMessage] = useState<TReceive | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const queueRef = useRef<string[]>([])
  const shouldReconnectRef = useRef(true)

  useEffect(() => {
    function connect() {
      setStatus('connecting')
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('open')
        retriesRef.current = 0
        // Flush queued messages
        while (queueRef.current.length > 0) {
          ws.send(queueRef.current.shift()!)
        }
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data) as TReceive
        setLastMessage(message)
        onMessage?.(message)
      }

      ws.onclose = () => {
        setStatus('closed')
        wsRef.current = null
        if (shouldReconnectRef.current && retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 30000)
          retriesRef.current++
          setTimeout(connect, delay + delay * 0.2 * Math.random())
        }
      }
    }

    shouldReconnectRef.current = true
    connect()

    return () => {
      shouldReconnectRef.current = false
      wsRef.current?.close(1000)
    }
  }, [url, maxRetries, onMessage, heartbeatInterval])

  const send = useCallback((message: TSend) => {
    const data = JSON.stringify(message)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    } else {
      queueRef.current.push(data) // Queue while disconnected
    }
  }, [])

  return { status, lastMessage, send }
}
```

## Authentication

### Cookie-Based (Preferred for Same Origin)

```tsx
// Server sets HttpOnly cookie on login via REST
// WebSocket handshake automatically includes cookies
const ws = new WebSocket('wss://api.example.com/ws')
// Cookies are sent in the upgrade request headers
```

### Token in Query Params (Simple)

```tsx
const ws = new WebSocket(`wss://api.example.com/ws?token=${jwt}`)
// Caveat: token visible in server logs, proxy logs, browser history
```

### Ticket-Based (Most Secure)

```tsx
// 1. Request short-lived ticket via REST
const { ticket } = await fetch('/api/ws-ticket', { method: 'POST' }).then(r => r.json())

// 2. Connect with one-time ticket (expires in 30s)
const ws = new WebSocket(`wss://api.example.com/ws?ticket=${ticket}`)

// 3. Server validates and consumes ticket on handshake (can't be reused)
```

## Testing

### Mock WebSocket in Tests

```tsx
class MockWebSocket {
  static instances: MockWebSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  readyState = 0

  constructor(public url: string) {
    MockWebSocket.instances.push(this)
    setTimeout(() => { this.readyState = 1; this.onopen?.() }, 0)
  }

  send(data: string) { /* capture sent messages for assertions */ }
  close() { this.readyState = 3; this.onclose?.() }

  // Test helper — simulate server message
  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
}

// In test setup
vi.stubGlobal('WebSocket', MockWebSocket)
```
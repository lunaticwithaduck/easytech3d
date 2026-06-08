# Example: WebSocket Chat with Typed Protocol

Real-time chat using a custom `useWebSocket` hook with exponential backoff, message queuing, typed discriminated union protocol, and React components.

## Typed Message Protocol

```tsx
// types/chat.ts

// Client → Server
type ClientMessage =
  | { type: 'join'; payload: { roomId: string; username: string } }
  | { type: 'leave'; payload: { roomId: string } }
  | { type: 'chat'; payload: { roomId: string; text: string } }
  | { type: 'typing'; payload: { roomId: string } }
  | { type: 'stop-typing'; payload: { roomId: string } }
  | { type: 'ping' }

// Server → Client
type ServerMessage =
  | { type: 'chat'; payload: { id: string; userId: string; username: string; text: string; roomId: string; timestamp: number } }
  | { type: 'system'; payload: { text: string; roomId: string; timestamp: number } }
  | { type: 'typing'; payload: { userId: string; username: string; roomId: string } }
  | { type: 'stop-typing'; payload: { userId: string; roomId: string } }
  | { type: 'presence'; payload: { roomId: string; users: Array<{ id: string; username: string; status: 'online' | 'away' }> } }
  | { type: 'history'; payload: { roomId: string; messages: Array<{ id: string; userId: string; username: string; text: string; timestamp: number }> } }
  | { type: 'error'; payload: { code: string; message: string } }
  | { type: 'pong' }
```

## useWebSocket Hook

```tsx
// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react'

type ConnectionStatus = 'connecting' | 'open' | 'closed'

interface UseWebSocketOptions<TReceive> {
  url: string
  onMessage?: (message: TReceive) => void
  enabled?: boolean
  maxRetries?: number
  heartbeatInterval?: number
}

export function useWebSocket<TSend, TReceive>({
  url,
  onMessage,
  enabled = true,
  maxRetries = Infinity,
  heartbeatInterval = 30000,
}: UseWebSocketOptions<TReceive>) {
  const [status, setStatus] = useState<ConnectionStatus>('closed')
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const queueRef = useRef<string[]>([])
  const shouldReconnectRef = useRef(true)
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>()
  const pongTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!enabled) return

    function startHeartbeat(ws: WebSocket) {
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify({ type: 'ping' }))

        pongTimeoutRef.current = setTimeout(() => {
          ws.close(4000, 'Heartbeat timeout')
        }, 5000)
      }, heartbeatInterval)
    }

    function stopHeartbeat() {
      clearInterval(heartbeatRef.current)
      clearTimeout(pongTimeoutRef.current)
    }

    function connect() {
      setStatus('connecting')
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('open')
        retriesRef.current = 0
        startHeartbeat(ws)

        // Flush queued messages
        while (queueRef.current.length > 0) {
          ws.send(queueRef.current.shift()!)
        }
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data) as TReceive

        // Handle pong — clear heartbeat timeout
        if ((message as { type: string }).type === 'pong') {
          clearTimeout(pongTimeoutRef.current)
          return
        }

        onMessageRef.current?.(message)
      }

      ws.onclose = () => {
        setStatus('closed')
        wsRef.current = null
        stopHeartbeat()

        if (shouldReconnectRef.current && retriesRef.current < maxRetries) {
          const baseDelay = Math.min(1000 * 2 ** retriesRef.current, 30000)
          const jitter = baseDelay * 0.2 * Math.random()
          retriesRef.current++
          setTimeout(connect, baseDelay + jitter)
        }
      }

      ws.onerror = () => {} // onclose fires after onerror
    }

    shouldReconnectRef.current = true
    connect()

    return () => {
      shouldReconnectRef.current = false
      stopHeartbeat()
      wsRef.current?.close(1000, 'Component unmounted')
    }
  }, [url, enabled, maxRetries, heartbeatInterval])

  const send = useCallback((message: TSend) => {
    const data = JSON.stringify(message)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    } else {
      queueRef.current.push(data) // Queue while disconnected
    }
  }, [])

  return { status, send }
}
```

## useChat Hook

```tsx
// hooks/useChat.ts
import { useState, useCallback, useRef } from 'react'
import { useWebSocket } from './useWebSocket'
import type { ClientMessage, ServerMessage } from '@/types/chat'

interface ChatMessage {
  id: string
  userId: string
  username: string
  text: string
  timestamp: number
}

interface UseChatOptions {
  url: string
  roomId: string
  username: string
}

export function useChat({ url, roomId, username }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; username: string; status: 'online' | 'away' }>>([])
  const [error, setError] = useState<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'chat':
        setMessages((prev) => [...prev, message.payload])
        break

      case 'history':
        if (message.payload.roomId === roomId) {
          setMessages(message.payload.messages)
        }
        break

      case 'typing':
        setTypingUsers((prev) => new Map(prev).set(message.payload.userId, message.payload.username))
        break

      case 'stop-typing':
        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.delete(message.payload.userId)
          return next
        })
        break

      case 'presence':
        if (message.payload.roomId === roomId) {
          setOnlineUsers(message.payload.users)
        }
        break

      case 'system':
        setMessages((prev) => [
          ...prev,
          { id: `system-${Date.now()}`, userId: 'system', username: 'System', text: message.payload.text, timestamp: message.payload.timestamp },
        ])
        break

      case 'error':
        setError(message.payload.message)
        break
    }
  }, [roomId])

  const { status, send } = useWebSocket<ClientMessage, ServerMessage>({
    url,
    onMessage: handleMessage,
  })

  // Auto-join room when connected
  const hasJoinedRef = useRef(false)
  if (status === 'open' && !hasJoinedRef.current) {
    hasJoinedRef.current = true
    send({ type: 'join', payload: { roomId, username } })
  }
  if (status !== 'open') {
    hasJoinedRef.current = false
  }

  const sendMessage = useCallback(
    (text: string) => {
      send({ type: 'chat', payload: { roomId, text } })
      send({ type: 'stop-typing', payload: { roomId } })
    },
    [send, roomId],
  )

  const sendTyping = useCallback(() => {
    send({ type: 'typing', payload: { roomId } })

    // Auto-stop typing after 3 seconds of inactivity
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      send({ type: 'stop-typing', payload: { roomId } })
    }, 3000)
  }, [send, roomId])

  return {
    messages,
    typingUsers: Array.from(typingUsers.values()),
    onlineUsers,
    status,
    error,
    sendMessage,
    sendTyping,
  }
}
```

## Chat Component

```tsx
// components/ChatRoom.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'

interface ChatRoomProps {
  roomId: string
  username: string
  wsUrl: string
}

export function ChatRoom({ roomId, username, wsUrl }: ChatRoomProps) {
  const { messages, typingUsers, onlineUsers, status, error, sendMessage, sendTyping } = useChat({
    url: wsUrl,
    roomId,
    username,
  })

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== 'open') return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-[600px] rounded-xl border">
      {/* Sidebar — online users */}
      <aside className="w-48 border-r p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Online ({onlineUsers.length})
        </h3>
        <ul className="space-y-1">
          {onlineUsers.map((user) => (
            <li key={user.id} className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Connection status */}
        <header className="flex items-center gap-2 border-b px-4 py-2">
          <span
            className={`h-2 w-2 rounded-full ${
              status === 'open' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {status === 'open' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
          {error && <span className="ml-auto text-xs text-destructive">{error}</span>}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.userId === 'system' ? 'items-center' : ''}`}
              >
                {msg.userId === 'system' ? (
                  <p className="text-xs text-muted-foreground italic">{msg.text}</p>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{msg.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-1 text-xs text-muted-foreground">
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(', ')} are typing...`}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              sendTyping()
            }}
            placeholder={status === 'open' ? 'Type a message...' : 'Reconnecting...'}
            disabled={status !== 'open'}
            className="h-10 flex-1 rounded-lg border px-3 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status !== 'open' || !input.trim()}
            className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
```

## Server (Node.js + ws)

```tsx
// server/ws-server.ts
import { WebSocketServer, WebSocket } from 'ws'

interface Client {
  ws: WebSocket
  userId: string
  username: string
  rooms: Set<string>
}

const wss = new WebSocketServer({ port: 8080 })
const clients = new Map<WebSocket, Client>()
const rooms = new Map<string, Set<WebSocket>>()

wss.on('connection', (ws) => {
  const userId = crypto.randomUUID()

  ws.on('message', (raw) => {
    const message = JSON.parse(raw.toString())

    switch (message.type) {
      case 'join': {
        const { roomId, username } = message.payload
        const client: Client = { ws, userId, username, rooms: new Set([roomId]) }
        clients.set(ws, client)

        if (!rooms.has(roomId)) rooms.set(roomId, new Set())
        rooms.get(roomId)!.add(ws)

        // Send history
        ws.send(JSON.stringify({ type: 'history', payload: { roomId, messages: [] } }))

        // Broadcast join
        broadcast(roomId, { type: 'system', payload: { text: `${username} joined`, roomId, timestamp: Date.now() } })
        broadcastPresence(roomId)
        break
      }

      case 'chat': {
        const client = clients.get(ws)
        if (!client) return

        broadcast(message.payload.roomId, {
          type: 'chat',
          payload: {
            id: crypto.randomUUID(),
            userId: client.userId,
            username: client.username,
            text: message.payload.text,
            roomId: message.payload.roomId,
            timestamp: Date.now(),
          },
        })
        break
      }

      case 'typing':
      case 'stop-typing': {
        const client = clients.get(ws)
        if (!client) return
        broadcast(message.payload.roomId, {
          type: message.type,
          payload: { userId: client.userId, username: client.username, roomId: message.payload.roomId },
        }, ws) // Exclude sender
        break
      }

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break
    }
  })

  ws.on('close', () => {
    const client = clients.get(ws)
    if (client) {
      for (const roomId of client.rooms) {
        rooms.get(roomId)?.delete(ws)
        broadcast(roomId, {
          type: 'system',
          payload: { text: `${client.username} left`, roomId, timestamp: Date.now() },
        })
        broadcastPresence(roomId)
      }
      clients.delete(ws)
    }
  })
})

function broadcast(roomId: string, message: object, exclude?: WebSocket) {
  const data = JSON.stringify(message)
  for (const ws of rooms.get(roomId) ?? []) {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  }
}

function broadcastPresence(roomId: string) {
  const users = Array.from(rooms.get(roomId) ?? [])
    .map((ws) => clients.get(ws))
    .filter(Boolean)
    .map((c) => ({ id: c!.userId, username: c!.username, status: 'online' as const }))

  broadcast(roomId, { type: 'presence', payload: { roomId, users } })
}
```

## Key Patterns

1. **Discriminated union protocol** — `ClientMessage` and `ServerMessage` use a `type` field as discriminant. `switch (message.type)` gives exhaustive type narrowing with no casts.
2. **Ref-based callback stability** — `onMessageRef` stores the latest callback without causing WebSocket reconnection when the callback reference changes.
3. **Message queue** — Messages sent while disconnected are buffered in `queueRef` and flushed on reconnect, preventing lost messages during brief disconnections.
4. **Heartbeat with dead connection detection** — Client sends `ping` every 30s. If no `pong` within 5s, the connection is assumed dead and closed, triggering reconnection.
5. **Typing debounce** — `sendTyping` auto-sends `stop-typing` after 3s of inactivity, preventing stale "user is typing" indicators.
6. **Room-scoped broadcasting** — Server maintains `rooms` Map for efficient message routing. `broadcast()` accepts optional `exclude` parameter for sender-exclusion (typing indicators).

# Browser Storage

## localStorage & sessionStorage

### TypeScript-Safe Wrappers

```tsx
function getStorageItem<T>(key: string, storage: Storage = localStorage): T | null {
  try {
    const item = storage.getItem(key)
    return item ? (JSON.parse(item) as T) : null
  } catch {
    return null
  }
}

function setStorageItem<T>(key: string, value: T, storage: Storage = localStorage): boolean {
  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded for key:', key)
    }
    return false
  }
}

function removeStorageItem(key: string, storage: Storage = localStorage): void {
  storage.removeItem(key)
}
```

### React Hook for localStorage

```tsx
import { useState, useEffect, useCallback } from 'react'

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue // SSR safe
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(newValue))
        } catch (e) {
          console.error('Failed to save to localStorage:', e)
        }
        return newValue
      })
    },
    [key],
  )

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T)
        } catch {
          // ignore parse errors from other tabs
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
```

**Usage:**
```tsx
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
const [cart, setCart] = useLocalStorage<CartItem[]>('cart', [])
```

### Cross-Tab Synchronization

The `storage` event fires in **other tabs** (not the one that wrote):

```tsx
// Tab A writes:
localStorage.setItem('user', JSON.stringify({ name: 'Alice' }))

// Tab B receives:
window.addEventListener('storage', (e: StorageEvent) => {
  if (e.key === 'user') {
    const newUser = JSON.parse(e.newValue!) // { name: 'Alice' }
  }
})
```

For **same-tab** communication (e.g., between components in different parts of the tree), use `BroadcastChannel`:

```tsx
const channel = new BroadcastChannel('app-state')

// Send (works across all tabs AND same tab)
channel.postMessage({ type: 'theme-changed', theme: 'dark' })

// Receive
channel.addEventListener('message', (e: MessageEvent) => {
  if (e.data.type === 'theme-changed') setTheme(e.data.theme)
})

// Cleanup
channel.close()
```

### Limitations

| Limitation | Detail |
|-----------|--------|
| Size | ~5MB per origin (varies by browser) |
| API | Synchronous (blocks main thread for large values) |
| Values | String only (JSON.stringify/parse required) |
| Expiration | None built-in (must implement manually) |
| SSR | Not available on server (`typeof window === 'undefined'`) |
| Privacy | Cleared by "Clear site data" in browser |

---

## IndexedDB

### Raw API (Without Library)

```tsx
function openDB(name: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores (tables)
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true })
        store.createIndex('title', 'title', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// CRUD operations
async function addNote(db: IDBDatabase, note: Omit<Note, 'id'>): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readwrite')
    const store = tx.objectStore('notes')
    const request = store.add(note)
    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

async function getAllNotes(db: IDBDatabase): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readonly')
    const store = tx.objectStore('notes')
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
```

> The raw IndexedDB API is verbose and callback-based. **Dexie.js is recommended** for production use.

### Dexie.js (Recommended Wrapper)

```tsx
import Dexie, { type Table } from 'dexie'

interface Note {
  id?: number
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface SyncQueueItem {
  id?: number
  action: 'create' | 'update' | 'delete'
  entityType: string
  entityId: string
  payload: unknown
  timestamp: number
}

class AppDatabase extends Dexie {
  notes!: Table<Note>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('myAppDB')

    // Version 1: initial schema
    this.version(1).stores({
      notes: '++id, title, *tags, createdAt',
      syncQueue: '++id, action, entityType, timestamp',
    })

    // Version 2: add compound index
    this.version(2).stores({
      notes: '++id, title, *tags, createdAt, [tags+createdAt]',
      syncQueue: '++id, action, entityType, timestamp',
    })

    // Version 3: data migration
    this.version(3)
      .stores({
        notes: '++id, title, *tags, createdAt, updatedAt, [tags+createdAt]',
        syncQueue: '++id, action, entityType, timestamp',
      })
      .upgrade((tx) => {
        return tx.table('notes').toCollection().modify((note) => {
          note.updatedAt = note.updatedAt ?? note.createdAt
        })
      })
  }
}

export const db = new AppDatabase()
```

### Dexie Index Syntax

| Syntax | Meaning |
|--------|---------|
| `++id` | Auto-incrementing primary key |
| `id` | Non-auto primary key |
| `&email` | Unique index |
| `*tags` | Multi-entry index (array values) |
| `[a+b]` | Compound index |
| `` | No index (still stored, not queryable via where) |

### Dexie Operations

```tsx
// Create
await db.notes.add({ title: 'New Note', content: '...', tags: ['work'], createdAt: new Date(), updatedAt: new Date() })
await db.notes.bulkAdd([note1, note2, note3])

// Read
const note = await db.notes.get(1)
const allNotes = await db.notes.toArray()
const first = await db.notes.orderBy('createdAt').first()
const count = await db.notes.count()

// Query
const workNotes = await db.notes.where('tags').equals('work').toArray()
const recent = await db.notes.where('createdAt').above(oneWeekAgo).sortBy('createdAt')
const range = await db.notes.where('createdAt').between(start, end).toArray()
const tagged = await db.notes.where('tags').anyOf(['work', 'urgent']).toArray()

// Update
await db.notes.update(1, { title: 'Updated Title', updatedAt: new Date() })
await db.notes.where('tags').equals('old').modify({ tags: ['archived'] })

// Delete
await db.notes.delete(1)
await db.notes.where('createdAt').below(oneYearAgo).delete()

// Transactions
await db.transaction('rw', db.notes, db.syncQueue, async () => {
  const id = await db.notes.add(newNote)
  await db.syncQueue.add({ action: 'create', entityType: 'note', entityId: String(id), payload: newNote, timestamp: Date.now() })
})
```

### Dexie + React (useLiveQuery)

```tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

function NotesList({ tag }: { tag?: string }) {
  // Reactive — updates automatically when IndexedDB changes
  const notes = useLiveQuery(
    () =>
      tag
        ? db.notes.where('tags').equals(tag).sortBy('createdAt')
        : db.notes.orderBy('createdAt').reverse().toArray(),
    [tag], // dependency array — re-runs query when tag changes
  )

  if (!notes) return <Skeleton /> // undefined while loading

  return notes.map(note => <NoteCard key={note.id} note={note} />)
}
```

---

## Cookies (Client-Side)

### js-cookie Library

```tsx
import Cookies from 'js-cookie'

// Set
Cookies.set('theme', 'dark', {
  expires: 365,       // days
  path: '/',
  sameSite: 'Lax',
  secure: true,        // HTTPS only
})

// Get
const theme = Cookies.get('theme') // 'dark' | undefined

// Remove
Cookies.remove('theme', { path: '/' })

// Get all cookies
const all = Cookies.get() // { theme: 'dark', ... }
```

### Cookie Attributes

| Attribute | Purpose | Default |
|-----------|---------|---------|
| `expires` | Days until expiry (or Date object) | Session (browser close) |
| `path` | URL path scope | `/` |
| `domain` | Domain scope | Current domain |
| `secure` | HTTPS only | `false` |
| `sameSite` | CSRF protection: `Strict`, `Lax`, `None` | `Lax` |
| `httpOnly` | JavaScript cannot read (server-set only) | `false` |

### Cookies vs localStorage

| Factor | Cookies | localStorage |
|--------|---------|-------------|
| Auto-sent to server | Yes (every request) | No |
| Size | ~4KB per cookie | ~5MB total |
| Expiration | Built-in (`expires`, `max-age`) | None |
| HttpOnly option | Yes (protects from XSS) | No |
| Best for | Auth tokens, server-needed data | Client-only preferences, cache |

---

## Cache API

Primarily used by Service Workers but accessible from main thread:

```tsx
const cache = await caches.open('v1')

// Store a response
await cache.put('/api/data', new Response(JSON.stringify(data)))

// Retrieve
const response = await cache.match('/api/data')
const data = response ? await response.json() : null

// Delete
await cache.delete('/api/data')
await caches.delete('v1') // Delete entire cache
```

See the realtime skill's Service Worker reference for cache strategy patterns.

---

## Storage Quota

```tsx
async function checkStorageQuota() {
  if (!navigator.storage?.estimate) return null
  const { usage, quota } = await navigator.storage.estimate()
  return {
    usedMB: Math.round((usage ?? 0) / 1024 / 1024),
    totalMB: Math.round((quota ?? 0) / 1024 / 1024),
    percentUsed: Math.round(((usage ?? 0) / (quota ?? 1)) * 100),
  }
}

// Request persistent storage (prevents browser eviction)
async function requestPersistence(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  return navigator.storage.persist()
}
```

---

## Security Considerations

| Risk | Storage | Mitigation |
|------|---------|------------|
| XSS reads auth tokens | localStorage, sessionStorage, JS-accessible cookies | Use HttpOnly cookies for auth tokens |
| Data tampering | All client storage | Always validate on server — never trust client data |
| Quota exceeded | All | Check quota before large writes, handle errors gracefully |
| Stale data | All | Implement TTL checks, sync with server regularly |
| Clear on browser reset | All | Keep source of truth on server, use client storage as cache only |
| Cross-site tracking | Cookies | Set `SameSite: Lax` or `Strict`, avoid third-party cookies |
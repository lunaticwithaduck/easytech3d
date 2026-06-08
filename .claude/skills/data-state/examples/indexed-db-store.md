# Example: IndexedDB with Dexie.js

Offline-first storage pattern with Dexie.js, reactive React queries, and background server sync.

## Database Definition

```tsx
// lib/db.ts
import Dexie, { type Table } from 'dexie'

interface Note {
  id?: number
  serverId?: string        // Server-assigned ID (undefined until synced)
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface SyncQueueItem {
  id?: number
  action: 'create' | 'update' | 'delete'
  entityType: 'note'
  entityId: number         // Local IndexedDB ID
  payload: unknown
  timestamp: number
  retryCount: number
}

class AppDatabase extends Dexie {
  notes!: Table<Note>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('notesApp')

    this.version(1).stores({
      notes: '++id, serverId, *tags, createdAt, updatedAt',
      syncQueue: '++id, action, entityType, timestamp',
    })

    // v2: add compound index for filtered queries
    this.version(2).stores({
      notes: '++id, serverId, *tags, createdAt, updatedAt, [tags+updatedAt]',
      syncQueue: '++id, action, entityType, timestamp, retryCount',
    }).upgrade((tx) => {
      return tx.table('syncQueue').toCollection().modify((item) => {
        item.retryCount = item.retryCount ?? 0
      })
    })
  }
}

export const db = new AppDatabase()
```

## React Hook

```tsx
// hooks/useNotes.ts
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { queueSync } from '@/lib/sync'

export function useNotes(tag?: string) {
  // Reactive query — updates automatically when IndexedDB changes
  const notes = useLiveQuery(
    () =>
      tag
        ? db.notes.where('tags').equals(tag).reverse().sortBy('updatedAt')
        : db.notes.orderBy('updatedAt').reverse().toArray(),
    [tag],
  )

  const pendingCount = useLiveQuery(() => db.syncQueue.count())

  async function addNote(title: string, content: string, tags: string[] = []) {
    const now = new Date()
    const note = { title, content, tags, createdAt: now, updatedAt: now }

    // Write to IndexedDB immediately (optimistic)
    const id = await db.notes.add(note)

    // Queue server sync
    await queueSync('create', 'note', id, note)

    return id
  }

  async function updateNote(id: number, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) {
    const updatedFields = { ...updates, updatedAt: new Date() }

    // Update IndexedDB immediately
    await db.notes.update(id, updatedFields)

    // Queue server sync
    await queueSync('update', 'note', id, updatedFields)
  }

  async function deleteNote(id: number) {
    // Delete from IndexedDB immediately
    await db.notes.delete(id)

    // Queue server sync
    await queueSync('delete', 'note', id, null)
  }

  return {
    notes: notes ?? [],
    isLoading: notes === undefined,
    pendingCount: pendingCount ?? 0,
    addNote,
    updateNote,
    deleteNote,
  }
}
```

## Sync Engine

```tsx
// lib/sync.ts
import { db } from './db'

const MAX_RETRIES = 5
const BASE_DELAY = 1000

export async function queueSync(
  action: 'create' | 'update' | 'delete',
  entityType: 'note',
  entityId: number,
  payload: unknown,
) {
  await db.syncQueue.add({
    action,
    entityType,
    entityId,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  })

  // Try to sync immediately if online
  if (navigator.onLine) {
    processSyncQueue()
  }
}

export async function processSyncQueue() {
  const pending = await db.syncQueue
    .where('retryCount')
    .below(MAX_RETRIES)
    .sortBy('timestamp')

  for (const item of pending) {
    try {
      await syncItem(item)
      await db.syncQueue.delete(item.id!)
    } catch (error) {
      // Increment retry count with exponential backoff
      await db.syncQueue.update(item.id!, {
        retryCount: item.retryCount + 1,
      })
      console.warn(`Sync failed for ${item.action} ${item.entityType}:`, error)
      break // Stop processing — later items may depend on this one
    }
  }
}

async function syncItem(item: SyncQueueItem) {
  const baseUrl = '/api/notes'

  switch (item.action) {
    case 'create': {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      })
      if (!response.ok) throw new Error(`Create failed: ${response.status}`)
      const serverNote = await response.json()
      // Update local record with server-assigned ID
      await db.notes.update(item.entityId, { serverId: serverNote.id })
      break
    }
    case 'update': {
      const note = await db.notes.get(item.entityId)
      if (!note?.serverId) throw new Error('Cannot update — no server ID yet')
      const response = await fetch(`${baseUrl}/${note.serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      })
      if (!response.ok) throw new Error(`Update failed: ${response.status}`)
      break
    }
    case 'delete': {
      const note = await db.notes.get(item.entityId)
      if (note?.serverId) {
        const response = await fetch(`${baseUrl}/${note.serverId}`, { method: 'DELETE' })
        if (!response.ok && response.status !== 404) throw new Error(`Delete failed: ${response.status}`)
      }
      break
    }
  }
}

// Auto-sync triggers
if (typeof window !== 'undefined') {
  // Sync when coming back online
  window.addEventListener('online', () => processSyncQueue())

  // Sync when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      processSyncQueue()
    }
  })

  // Periodic sync (every 30 seconds if online)
  setInterval(() => {
    if (navigator.onLine) processSyncQueue()
  }, 30000)
}
```

## Notes Component

```tsx
// components/NotesList.tsx
'use client'

import { useState } from 'react'
import { useNotes } from '@/hooks/useNotes'

export function NotesList() {
  const [selectedTag, setSelectedTag] = useState<string>()
  const { notes, isLoading, pendingCount, addNote, updateNote, deleteNote } = useNotes(selectedTag)

  if (isLoading) return <div className="animate-pulse">Loading notes...</div>

  return (
    <div className="space-y-4">
      {/* Sync status */}
      <div className="flex items-center gap-2">
        {!navigator.onLine && (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
            Offline
          </span>
        )}
        {pendingCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {pendingCount} change{pendingCount !== 1 ? 's' : ''} pending sync
          </span>
        )}
      </div>

      {/* Quick add */}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const title = (form.elements.namedItem('title') as HTMLInputElement).value
          if (title.trim()) {
            await addNote(title, '', [])
            form.reset()
          }
        }}
        className="flex gap-2"
      >
        <input name="title" placeholder="New note..." className="h-10 flex-1 rounded-lg border px-3" />
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground">
          Add
        </button>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-muted-foreground">No notes yet</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <h3 className="font-medium">{note.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {note.updatedAt.toLocaleDateString()}
                  {!note.serverId && ' (not synced)'}
                </p>
              </div>
              <button
                onClick={() => { if (confirm('Delete note?')) deleteNote(note.id!) }}
                className="text-sm text-destructive"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Key Patterns

1. **Dexie schema versioning** — `this.version(N).stores({})` with `.upgrade()` for data migrations. Runs automatically when database version changes.
2. **`useLiveQuery` for reactive queries** — Re-runs the query whenever underlying IndexedDB data changes. Returns `undefined` while loading.
3. **Write-behind cache** — Write to IndexedDB immediately (instant UI), queue server sync for background processing.
4. **Sync queue with retries** — Failed syncs increment `retryCount` with a max. Queue processes in order to maintain consistency.
5. **Offline detection** — `navigator.onLine` + `online`/`visibilitychange` events trigger sync when connectivity returns.
6. **Server ID mapping** — Local auto-increment ID vs server-assigned ID. `serverId` is populated after first successful sync.
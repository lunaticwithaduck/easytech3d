# SWR

SWR (stale-while-revalidate) — lightweight data fetching library by Vercel. Returns cached data first, then fetches fresh data in the background.

## Setup & Fetcher

```tsx
// lib/fetcher.ts
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('Fetch failed') as Error & { status: number }
    error.status = res.status
    throw error
  }
  return res.json()
}
```

## useSWR

### Basic Usage

```tsx
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<User>(
    `/api/users/${userId}`,
    fetcher,
  )

  if (isLoading) return <Skeleton />
  if (error) return <ErrorDisplay error={error} />
  if (!data) return null

  return (
    <div>
      <h1>{data.name}</h1>
      {isValidating && <span>Refreshing...</span>}
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  )
}
```

### Return Values

| Value | Type | Description |
|-------|------|-------------|
| `data` | `T \| undefined` | Fetched data (or undefined while loading) |
| `error` | `Error \| undefined` | Error thrown by fetcher |
| `isLoading` | `boolean` | First load, no data yet |
| `isValidating` | `boolean` | Any ongoing request (including revalidation) |
| `mutate` | `function` | Bound mutate for this key |

### Conditional Fetching

```tsx
// Pass null to skip the request
const { data } = useSWR(userId ? `/api/users/${userId}` : null, fetcher)
```

### Dependent Fetching

```tsx
// Second request waits for first to resolve
const { data: user } = useSWR<User>('/api/user', fetcher)
const { data: projects } = useSWR<Project[]>(
  user ? `/api/users/${user.id}/projects` : null,
  fetcher,
)
```

## Configuration Options

```tsx
const { data } = useSWR('/api/data', fetcher, {
  revalidateOnFocus: true,       // Refetch when window regains focus (default: true)
  revalidateOnReconnect: true,   // Refetch when network reconnects (default: true)
  refreshInterval: 0,            // Polling interval in ms (0 = disabled)
  dedupingInterval: 2000,        // Dedup requests within this window (ms)
  errorRetryCount: 3,            // Max error retries
  errorRetryInterval: 5000,      // Delay between retries (ms)
  fallbackData: initialData,     // Initial data (for SSR hydration)
  keepPreviousData: true,        // Keep showing old data while revalidating new key
  suspense: false,               // Enable React Suspense mode
  revalidateIfStale: true,       // Revalidate even if data exists in cache
  revalidateOnMount: true,       // Revalidate on component mount
})
```

## SWRConfig (Global Configuration)

```tsx
import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        errorRetryCount: 2,
        dedupingInterval: 5000,
        onError: (error, key) => {
          if (error.status === 401) redirectToLogin()
        },
        // SSR fallback data (from getServerSideProps or Server Component)
        fallback: {
          '/api/settings': preloadedSettings,
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
```

## Pagination & Infinite Loading

### useSWRInfinite

```tsx
import useSWRInfinite from 'swr/infinite'

interface Page {
  data: Post[]
  nextCursor: string | null
}

function PostFeed() {
  const getKey = (pageIndex: number, previousPageData: Page | null) => {
    if (previousPageData && !previousPageData.nextCursor) return null // end
    if (pageIndex === 0) return '/api/posts?limit=10'
    return `/api/posts?cursor=${previousPageData!.nextCursor}&limit=10`
  }

  const { data, size, setSize, isValidating, isLoading } = useSWRInfinite<Page>(getKey, fetcher)

  const posts = data?.flatMap(page => page.data) ?? []
  const isReachingEnd = data?.[data.length - 1]?.nextCursor === null
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      {!isReachingEnd && (
        <button onClick={() => setSize(size + 1)} disabled={isLoadingMore}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

## Mutations

### useSWRMutation (Trigger-Based)

```tsx
import useSWRMutation from 'swr/mutation'

async function createPost(url: string, { arg }: { arg: { title: string; body: string } }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error('Failed to create post')
  return res.json()
}

function CreatePostForm() {
  const { trigger, isMutating, error } = useSWRMutation('/api/posts', createPost)

  const handleSubmit = async (data: { title: string; body: string }) => {
    try {
      await trigger(data)
      // SWR automatically revalidates '/api/posts' after mutation
    } catch {
      // error is also available via the error return value
    }
  }

  return <form onSubmit={...}>...</form>
}
```

### Optimistic Updates with mutate

```tsx
import { mutate } from 'swr'

async function toggleTodo(todo: Todo) {
  const updated = { ...todo, completed: !todo.completed }

  // Optimistic update — update cache immediately
  mutate(
    '/api/todos',
    (current: Todo[] | undefined) => current?.map(t => (t.id === todo.id ? updated : t)),
    false, // Don't revalidate yet
  )

  try {
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: updated.completed }),
    })
    mutate('/api/todos') // Revalidate after server confirms
  } catch {
    mutate('/api/todos') // Revalidate to rollback on error
  }
}
```

### Bound mutate vs Global mutate

```tsx
// Bound mutate — from the same useSWR call (scoped to that key)
const { data, mutate: boundMutate } = useSWR('/api/user', fetcher)
boundMutate(newData) // Only affects '/api/user'

// Global mutate — can update any key from anywhere
import { mutate } from 'swr'
mutate('/api/user', newData) // Works from any component
mutate('/api/user')          // Revalidate without providing data
```

## Prefetching

```tsx
import { preload } from 'swr'

// Prefetch before component mounts (e.g., on hover)
function NavLink({ href, userId }: { href: string; userId: string }) {
  return (
    <Link
      href={href}
      onMouseEnter={() => preload(`/api/users/${userId}`, fetcher)}
    >
      View Profile
    </Link>
  )
}
```

## Middleware

```tsx
import type { SWRHook, Middleware } from 'swr'

// Logger middleware
const logger: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const swr = useSWRNext(key, fetcher, config)
  useEffect(() => {
    if (swr.data) console.log(`[SWR] ${key}:`, swr.data)
  }, [swr.data, key])
  return swr
}

// Usage
<SWRConfig value={{ use: [logger] }}>
```

## SWR vs TanStack Query

| Feature | SWR | TanStack Query |
|---------|-----|---------------|
| Bundle size | ~4KB | ~13KB |
| Default strategy | Stale-while-revalidate | Configurable staleTime + gcTime |
| Devtools | None built-in | TanStack Devtools (visual) |
| Infinite queries | `useSWRInfinite` | `useInfiniteQuery` |
| Mutations | `useSWRMutation` | `useMutation` |
| Optimistic updates | Manual `mutate()` | `onMutate`/`onError`/`onSettled` |
| Query invalidation | `mutate(key)` or global `mutate` | `invalidateQueries` by key/prefix |
| Suspense | Built-in option | Built-in option |
| SSR hydration | `SWRConfig fallback` | `HydrationBoundary` |
| Dependent queries | Null key | `enabled` option |
| Prefetching | `preload()` | `prefetchQuery()` |
| Garbage collection | None (manual cleanup) | Automatic (`gcTime`) |
| Offline support | Basic | Built-in with persist plugins |
| Parallel queries | Multiple `useSWR` calls | `useQueries` helper |

### When to Choose SWR

- Vercel/Next.js ecosystem (first-party integration)
- Bundle size is a priority
- Simple fetch + cache + revalidate is sufficient
- Prefer minimal configuration and API surface

### When to Choose TanStack Query

- Complex cache invalidation patterns (query key matching)
- Need devtools for debugging cache state
- Frequent optimistic updates (structured `onMutate` pattern)
- Offline-first with cache persistence
- Need automatic garbage collection of stale cache entries
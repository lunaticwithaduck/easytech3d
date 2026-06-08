---
name: data-state
description: >
  This skill should be used when the user asks about "Redux", "Redux Toolkit",
  "RTK Query", "createSlice", "createAsyncThunk", "configureStore", "entityAdapter",
  "SWR", "useSWR", "SWR mutation", "localStorage", "sessionStorage", "IndexedDB",
  "browser storage", "cookies (client-side)", "Dexie", "state persistence",
  "cache normalization", "migrating from Redux", "migrating to TanStack Query",
  or needs to choose between data-fetching and state management libraries.
keywords:
  - Redux
  - Redux Toolkit
  - RTK Query
  - createSlice
  - createAsyncThunk
  - configureStore
  - entityAdapter
  - SWR
  - useSWR
  - localStorage
  - sessionStorage
  - IndexedDB
  - Dexie
  - browser storage
  - state persistence
  - cache normalization
  - migrating from Redux
---

# Data State — Fetching, Caching & State Management Libraries

State management and data-fetching library knowledge covering Redux Toolkit, RTK Query, SWR, and browser storage APIs. For Zustand and TanStack Query patterns, see the react skill (`~/.claude/skills/react/references/state-management.md`).

## Library Selection Decision Tree

```
Need to manage data from an API?
├── Already using Redux in the project?
│   ├── Yes → RTK Query (built into @reduxjs/toolkit, no extra dep)
│   └── No, greenfield React project?
│       ├── React + Next.js (client data) → TanStack Query (see react skill)
│       ├── React + existing Redux store → RTK Query
│       └── Simple components, minimal caching → SWR
│
Need global client-side state (UI state, not server data)?
├── Large team, strict architecture, time-travel debugging → Redux Toolkit
├── Small team, minimal boilerplate → Zustand (see react skill)
└── Shared between components on same page only → React Context + useReducer
│
Need to persist state across page reloads?
├── Small data (<5MB), string-serializable → localStorage
├── Session-scoped (cleared on tab close) → sessionStorage
├── Large/structured/queryable data → IndexedDB (raw or Dexie.js)
└── Auth tokens or session data → HttpOnly cookies (server-set, not JS)
```

## Library Comparison

| Library | Bundle | Best For | Cache Invalidation | Normalized Cache | Devtools |
|---------|--------|----------|--------------------|-----------------|----------|
| RTK Query | ~14KB (in RTK) | Redux-centric apps | Tag-based (providesTags/invalidatesTags) | Automatic via entityAdapter | Redux DevTools |
| TanStack Query | ~13KB | Any React app | Query key-based (invalidateQueries) | Manual (setQueryData) | TanStack Devtools |
| SWR | ~4KB | Lightweight fetching | `mutate()` by key | Manual | None built-in |
| Zustand | ~1KB | Client/UI state | Manual set | No | Redux DevTools via middleware |

## RTK Query Quick Pattern

```tsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'User' as const, id })), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
  }),
})

export const { useGetUsersQuery, useDeleteUserMutation } = api
```

## SWR Quick Pattern

```tsx
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function UserList() {
  const { data, error, isLoading } = useSWR<User[]>('/api/users', fetcher)
  const { trigger: deleteUser } = useSWRMutation(
    '/api/users',
    async (url, { arg: id }: { arg: string }) => {
      await fetch(`${url}/${id}`, { method: 'DELETE' })
    },
  )

  if (isLoading) return <Skeleton />
  if (error) return <ErrorDisplay error={error} />
  return data?.map(user => <UserCard key={user.id} user={user} onDelete={() => deleteUser(user.id)} />)
}
```

## Browser Storage Decision Tree

```
Storing client-side data?
├── Temporary, session-scoped only?
│   └── sessionStorage (cleared when tab closes)
├── Small (<5MB), simple key-value, survives browser close?
│   └── localStorage
├── Sensitive auth state?
│   └── HttpOnly cookie (server-set — never store tokens in localStorage)
├── Large structured data, needs indexes/queries?
│   └── IndexedDB → raw API or Dexie.js wrapper
├── Need to sync state across tabs?
│   └── BroadcastChannel API + localStorage 'storage' event
└── Caching HTTP responses offline?
    └── Cache API (used by Service Workers)
```

## Storage Quick Reference

| API | Size Limit | Value Type | Sync/Async | Tab Scope | Persists |
|-----|-----------|-----------|-----------|-----------|----------|
| `localStorage` | ~5MB | string | Sync | All tabs (same origin) | Until cleared |
| `sessionStorage` | ~5MB | string | Sync | Current tab only | Until tab close |
| IndexedDB | 50MB+ (up to disk quota) | structured clone | Async | All tabs | Until cleared |
| Cookies | ~4KB per cookie | string | Sync | Configurable (path/domain) | Configurable expiry |
| Cache API | Disk quota | Response objects | Async | All tabs | Until cleared |

## Migration Patterns

| From | To | When | Effort |
|------|----|------|--------|
| Legacy Redux (connect/mapState) | Redux Toolkit (createSlice) | Modernizing existing Redux app | Low — incremental, slice by slice |
| Redux + Saga/Thunk for API | RTK Query | Staying in Redux ecosystem | Medium — rewrite API layer |
| RTK Query | TanStack Query | Removing Redux entirely | Medium — remap endpoints to query hooks |
| Redux (any) | Zustand | Small app, Redux is overkill | Low — one store at a time |
| Class components + Redux | Hooks + Zustand/TanStack Query | Full modernization | High — requires component rewrites |

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Storing JWT in localStorage | XSS can steal tokens | Use HttpOnly cookies (server-set) |
| Non-serializable values in Redux store | DevTools breaks, persist fails | Only store plain objects, arrays, primitives |
| Missing IndexedDB error handling | Silent failures on quota exceeded | Wrap operations in try/catch, check `navigator.storage.estimate()` |
| Using localStorage synchronously in SSR | `ReferenceError: localStorage is not defined` | Guard with `typeof window !== 'undefined'` or use `useEffect` |
| Not deduplicating SWR keys | Same data fetched multiple times | Use consistent key strings, share `fetcher` |
| Storing derived state in Redux | Stale computed values | Use `createSelector` (reselect) for derived data |
| Forgetting RTK Query tag invalidation | UI shows stale data after mutation | Always pair `providesTags` with `invalidatesTags` |

## References

- `~/.claude/skills/data-state/references/redux-toolkit.md` — Redux Toolkit fundamentals, RTK Query full setup, TypeScript patterns
- `~/.claude/skills/data-state/references/swr-guide.md` — SWR setup, hooks, pagination, mutations, comparison with TanStack Query
- `~/.claude/skills/data-state/references/browser-storage.md` — localStorage, sessionStorage, IndexedDB + Dexie.js, cookies, security
- `~/.claude/skills/data-state/references/migration-patterns.md` — Migration guides between state management libraries
- `~/.claude/skills/data-state/examples/rtk-query-crud.md` — Complete RTK Query CRUD with tag-based cache invalidation
- `~/.claude/skills/data-state/examples/indexed-db-store.md` — IndexedDB with Dexie.js, offline-first pattern
- `~/.claude/skills/react/references/state-management.md` — Zustand and TanStack Query patterns (existing, cross-reference)
# Example: Data Fetching Pattern

TanStack Query with custom hooks, error boundaries, loading states, and cache invalidation.

## Custom Query Hook

```tsx
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Query key factory
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// API functions
async function fetchUsers(filters: UserFilters): Promise<User[]> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.role) params.set('role', filters.role)
  params.set('page', String(filters.page ?? 1))

  const res = await fetch(`/api/users?${params}`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}

async function updateUser(input: UpdateUserInput): Promise<User> {
  const res = await fetch(`/api/users/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update user')
  return res.json()
}

async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete user')
}

// --- Hooks ---

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (previousData) => previousData, // Keep old data while fetching new
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    // Optimistic update
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({ queryKey: userKeys.detail(updatedUser.id) })
      const previous = queryClient.getQueryData<User>(userKeys.detail(updatedUser.id))
      queryClient.setQueryData<User>(userKeys.detail(updatedUser.id), (old) =>
        old ? { ...old, ...updatedUser } : old
      )
      return { previous }
    },
    onError: (_err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(userKeys.detail(vars.id), context.previous)
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(vars.id) })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
```

## User List Component

```tsx
// components/UserList.tsx
'use client'

import { useState } from 'react'
import { useUsers, useDeleteUser } from '@/hooks/useUsers'

export function UserList() {
  const [filters, setFilters] = useState<UserFilters>({ page: 1 })
  const { data: users, isLoading, error, isPlaceholderData } = useUsers(filters)
  const deleteUser = useDeleteUser()

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 p-6 text-center" role="alert">
        <p className="text-destructive">Failed to load users</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading users">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!users?.length) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed py-12 text-center">
        <p className="text-lg font-semibold">No users found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search filters.</p>
      </div>
    )
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.7 : 1, transition: 'opacity 200ms' }}>
      {/* Search */}
      <input
        type="search"
        placeholder="Search users..."
        aria-label="Search users"
        className="mb-4 h-10 w-full rounded-lg border px-3 text-sm"
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
      />

      {/* List */}
      <ul className="divide-y rounded-xl border" role="list">
        {users.map((user) => (
          <li key={user.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Delete ${user.name}?`)) {
                  deleteUser.mutate(user.id)
                }
              }}
              disabled={deleteUser.isPending}
              className="text-sm text-destructive hover:underline disabled:opacity-50"
              aria-label={`Delete ${user.name}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
          disabled={filters.page === 1}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
          disabled={isPlaceholderData || !users.length}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

## Error Boundary Wrapper

```tsx
// components/QueryErrorBoundary.tsx
'use client'

import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div className="rounded-xl border border-destructive/50 p-8 text-center" role="alert">
              <h3 className="text-lg font-semibold">Something went wrong</h3>
              <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
              <button
                onClick={resetErrorBoundary}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Try again
              </button>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

// Usage
<QueryErrorBoundary>
  <Suspense fallback={<UserListSkeleton />}>
    <UserList />
  </Suspense>
</QueryErrorBoundary>
```

## Key Patterns Demonstrated

1. **Query key factory** — organized, easy to invalidate at any level
2. **Custom hooks** — encapsulate API + query config, reusable across components
3. **Optimistic updates** — instant UI feedback with rollback on error
4. **Placeholder data** — keep showing old data while fetching new page
5. **Loading/error/empty states** — all three handled explicitly
6. **Error boundaries** — catch and recover from unexpected errors
7. **Skeleton loading** — content-shaped placeholders during load
8. **Cache invalidation** — mutations invalidate relevant queries
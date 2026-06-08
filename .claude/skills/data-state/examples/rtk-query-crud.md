# Example: RTK Query CRUD with Cache Tags

Complete CRUD implementation using RTK Query with tag-based cache invalidation, optimistic updates, and TypeScript.

## API Definition

```tsx
// lib/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  createdAt: string
}

interface UsersResponse {
  data: User[]
  total: number
  page: number
  pageSize: number
}

type CreateUserInput = Omit<User, 'id' | 'createdAt'>
type UpdateUserInput = Partial<CreateUserInput>

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // List with pagination + search
    getUsers: builder.query<UsersResponse, { page?: number; search?: string }>({
      query: ({ page = 1, search }) => ({
        url: '/users',
        params: { page, pageSize: 10, ...(search && { search }) },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    // Single user
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Create
    createUser: builder.mutation<User, CreateUserInput>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // Update with optimistic update
    updateUser: builder.mutation<User, { id: string; data: UpdateUserInput }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Optimistic update on the detail cache
        const patchResult = dispatch(
          api.util.updateQueryData('getUser', id, (draft) => {
            Object.assign(draft, data)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    // Delete
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = api
```

## Store Setup

```tsx
// lib/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from './api'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

## User List Component

```tsx
// components/UserList.tsx
'use client'

import { useState } from 'react'
import { useGetUsersQuery, useDeleteUserMutation } from '@/lib/api'

export function UserList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isFetching, error } = useGetUsersQuery(
    { page, search: search || undefined },
    { pollingInterval: 0 },
  )
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  if (isLoading) return <div className="animate-pulse">Loading users...</div>
  if (error) return <div className="text-destructive">Failed to load users</div>
  if (!data) return null

  const totalPages = Math.ceil(data.total / data.pageSize)

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="search"
        placeholder="Search users..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        className="h-10 w-64 rounded-lg border px-3 text-sm"
      />

      {isFetching && <span className="text-sm text-muted-foreground">Refreshing...</span>}

      {/* Table */}
      {data.data.length === 0 ? (
        <p className="text-muted-foreground">No users found</p>
      ) : (
        <table className="w-full rounded-xl border">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.data.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 text-sm">{user.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 text-sm capitalize">{user.role}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { if (confirm(`Delete ${user.name}?`)) deleteUser(user.id) }}
                    disabled={isDeleting}
                    className="text-sm text-destructive hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
        </div>
      )}
    </div>
  )
}
```

## User Form Component

```tsx
// components/UserForm.tsx
'use client'

import { useState } from 'react'
import { useCreateUserMutation, useUpdateUserMutation } from '@/lib/api'

interface UserFormProps {
  user?: { id: string; name: string; email: string; role: 'admin' | 'editor' | 'viewer' }
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [createUser, { isLoading: isCreating, error: createError }] = useCreateUserMutation()
  const [updateUser, { isLoading: isUpdating, error: updateError }] = useUpdateUserMutation()

  const isEditing = !!user
  const isSubmitting = isCreating || isUpdating
  const error = createError || updateError

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as 'admin' | 'editor' | 'viewer',
    }

    try {
      if (isEditing) {
        await updateUser({ id: user.id, data }).unwrap()
      } else {
        await createUser(data).unwrap()
      }
      onSuccess?.()
    } catch {
      // Error is available via the error return value
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-destructive">Failed to save user</div>}

      <input name="name" defaultValue={user?.name} placeholder="Name" required className="h-10 w-full rounded-lg border px-3" />
      <input name="email" type="email" defaultValue={user?.email} placeholder="Email" required className="h-10 w-full rounded-lg border px-3" />
      <select name="role" defaultValue={user?.role ?? 'viewer'} className="h-10 w-full rounded-lg border px-3">
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit" disabled={isSubmitting} className="h-10 rounded-lg bg-primary px-4 text-primary-foreground disabled:opacity-50">
        {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
      </button>
    </form>
  )
}
```

## Key Patterns

1. **Tag-based invalidation** — `providesTags` declares what a query caches, `invalidatesTags` declares what a mutation invalidates. RTK Query automatically refetches affected queries.
2. **LIST sentinel tag** — `{ type: 'User', id: 'LIST' }` invalidates the collection query without invalidating individual entity queries.
3. **Optimistic updates** — `onQueryStarted` + `api.util.updateQueryData` immediately updates the cache, with `undo()` on error for rollback.
4. **TypeScript inference** — Endpoint types flow through to generated hooks. `useGetUsersQuery` returns typed `data: UsersResponse`.
5. **`setupListeners`** — Enables `refetchOnFocus` and `refetchOnReconnect` behaviors globally.
6. **`.unwrap()`** — Converts RTK Query result to a standard Promise (throws on error, resolves with data).

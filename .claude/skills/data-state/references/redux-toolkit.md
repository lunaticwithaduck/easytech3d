# Redux Toolkit & RTK Query

## Redux Toolkit Core

### configureStore

```tsx
import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'
import uiReducer from './slices/uiSlice'
import cartReducer from './slices/cartSlice'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    ui: uiReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Typed Hooks

```tsx
// hooks.ts
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

### createSlice

```tsx
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = { items: [] }

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Basic reducer — Immer allows "mutating" syntax
    addItem(state, action: PayloadAction<Omit<CartItem, 'quantity'>>) {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        existing.quantity += 1 // Immer handles immutability
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload)
    },

    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find(i => i.id === action.payload.id)
      if (item) item.quantity = action.payload.quantity
    },

    // Prepare callback — customize action payload shape
    addItemWithTimestamp: {
      reducer(state, action: PayloadAction<CartItem & { addedAt: number }>) {
        state.items.push(action.payload)
      },
      prepare(item: Omit<CartItem, 'quantity'>) {
        return { payload: { ...item, quantity: 1, addedAt: Date.now() } }
      },
    },

    clearCart() {
      return initialState // Return new state entirely
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
```

### createAsyncThunk

```tsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
}

// Basic thunk
export const fetchUser = createAsyncThunk<User, string>(
  'users/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      return (await response.json()) as User
    } catch (error) {
      return rejectWithValue('User not found')
    }
  },
  {
    // Prevent duplicate fetches
    condition: (userId, { getState }) => {
      const state = getState() as RootState
      if (state.users.loadingById[userId]) return false // already loading
    },
  },
)

// Handle in slice
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    entities: {} as Record<string, User>,
    loadingById: {} as Record<string, boolean>,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state, action) => {
        state.loadingById[action.meta.arg] = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.entities[action.payload.id] = action.payload
        state.loadingById[action.meta.arg] = false
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loadingById[action.meta.arg] = false
        state.error = action.payload as string
      })
  },
})
```

> **Note:** RTK Query replaces most `createAsyncThunk` usage for API calls. Use `createAsyncThunk` only for non-API async work (file processing, complex workflows).

### createEntityAdapter

```tsx
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: number
}

const todosAdapter = createEntityAdapter<Todo>({
  selectId: (todo) => todo.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt, // newest first
})

const todosSlice = createSlice({
  name: 'todos',
  initialState: todosAdapter.getInitialState({ filter: 'all' as 'all' | 'active' | 'completed' }),
  reducers: {
    addTodo: todosAdapter.addOne,
    updateTodo: todosAdapter.updateOne,
    removeTodo: todosAdapter.removeOne,
    setTodos: todosAdapter.setAll,
    upsertTodos: todosAdapter.upsertMany,
    setFilter(state, action: PayloadAction<'all' | 'active' | 'completed'>) {
      state.filter = action.payload
    },
  },
})

// Generated selectors
export const {
  selectAll: selectAllTodos,
  selectById: selectTodoById,
  selectIds: selectTodoIds,
  selectTotal: selectTotalTodos,
} = todosAdapter.getSelectors((state: RootState) => state.todos)
```

### createSelector (Memoized Derived Data)

```tsx
import { createSelector } from '@reduxjs/toolkit'

const selectTodos = (state: RootState) => selectAllTodos(state)
const selectFilter = (state: RootState) => state.todos.filter

// Memoized — only recomputes when inputs change
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed)
      case 'completed': return todos.filter(t => t.completed)
      default: return todos
    }
  },
)

// Parameterized selector (factory pattern)
export const makeSelectTodosByTag = () =>
  createSelector(
    [selectTodos, (_state: RootState, tag: string) => tag],
    (todos, tag) => todos.filter(t => t.title.includes(tag)),
  )
```

---

## RTK Query

### createApi with fetchBaseQuery

```tsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['User', 'Post'],
  endpoints: () => ({}), // Injected below for code splitting
})
```

### Custom baseQuery with Token Refresh

```tsx
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
    if (refreshResult.data) {
      api.dispatch(setToken(refreshResult.data as string))
      result = await baseQuery(args, api, extraOptions) // retry
    } else {
      api.dispatch(logout())
    }
  }

  return result
}
```

### Query Endpoints

```tsx
const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List with pagination
    getUsers: builder.query<PaginatedResponse<User>, { page?: number; search?: string }>({
      query: ({ page = 1, search }) => ({
        url: '/users',
        params: { page, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    // Single entity
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Polling
    getLiveStats: builder.query<Stats, void>({
      query: () => '/stats',
      pollingInterval: 5000, // refetch every 5s
    }),
  }),
})

export const { useGetUsersQuery, useGetUserQuery, useGetLiveStatsQuery } = usersApi
```

### Mutation Endpoints

```tsx
const usersMutationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create
    createUser: builder.mutation<User, Omit<User, 'id'>>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // Update with optimistic update
    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Optimistic update
        const patchResult = dispatch(
          api.util.updateQueryData('getUser', id, (draft) => {
            Object.assign(draft, data)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo() // Rollback on error
        }
      },
    }),

    // Delete
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),
  }),
})

export const { useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } = usersMutationApi
```

### Code Splitting with injectEndpoints

```tsx
// features/posts/postsApi.ts
import { api } from '@/lib/api'

const postsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
  }),
})

export const { useGetPostsQuery } = postsApi
```

Each feature module injects its own endpoints — the API definition grows as modules are imported.

### transformResponse

```tsx
getUsers: builder.query<User[], void>({
  query: () => '/users',
  transformResponse: (response: { data: User[]; meta: unknown }) => response.data,
}),
```

---

## TypeScript Patterns

### Inferring Types from Endpoints

```tsx
type GetUsersResult = typeof api.endpoints.getUsers.Types.ResultType
type GetUsersArg = typeof api.endpoints.getUsers.Types.QueryArg
```

### Generic CRUD API Factory

```tsx
function createCrudEndpoints<T extends { id: string }>(
  builder: ReturnType<typeof api.injectEndpoints>,
  resourceName: string,
  tagType: string,
) {
  return {
    getAll: builder.query<T[], void>({
      query: () => `/${resourceName}`,
      providesTags: [tagType],
    }),
    getById: builder.query<T, string>({
      query: (id) => `/${resourceName}/${id}`,
      providesTags: (r, e, id) => [{ type: tagType, id }],
    }),
    create: builder.mutation<T, Omit<T, 'id'>>({
      query: (body) => ({ url: `/${resourceName}`, method: 'POST', body }),
      invalidatesTags: [tagType],
    }),
    update: builder.mutation<T, { id: string; data: Partial<T> }>({
      query: ({ id, data }) => ({ url: `/${resourceName}/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: tagType, id }],
    }),
    delete: builder.mutation<void, string>({
      query: (id) => ({ url: `/${resourceName}/${id}`, method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: tagType, id }],
    }),
  }
}
```

---

## Provider Setup

```tsx
// app/providers.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import { setupListeners } from '@reduxjs/toolkit/query'

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch)

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
```

## Best Practices

| Practice | Reason |
|----------|--------|
| Use RTK Query for all API calls | Eliminates manual loading/error state, automatic caching |
| Use `createSlice` for client-only state | Minimal boilerplate, Immer built-in |
| Use `createSelector` for derived data | Prevents unnecessary re-renders from recomputation |
| Use `entityAdapter` for normalized collections | Consistent CRUD operations, generated selectors |
| Use `injectEndpoints` for code splitting | API grows per feature, better bundle splitting |
| Pair `providesTags` with `invalidatesTags` | Automatic cache invalidation on mutations |
| Use `setupListeners` | Enables refetchOnFocus and refetchOnReconnect |
| Never store non-serializable values | Breaks devtools, persistence, and time-travel debugging |
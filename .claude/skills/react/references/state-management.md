# State Management

Zustand, TanStack Query, React Hook Form, and optimistic update patterns.

## Zustand

### Basic Store

```tsx
import { create } from 'zustand'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id)
    if (existing) {
      return { items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
    }
    return { items: [...state.items, { ...item, quantity: 1 }] }
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id),
  })),
  clearCart: () => set({ items: [] }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
```

### Selectors (Prevent Re-renders)

```tsx
// Bad: subscribes to entire store (re-renders on any change)
const store = useCartStore()

// Good: subscribe to specific slice
const items = useCartStore((s) => s.items)
const addItem = useCartStore((s) => s.addItem)

// Good: derived selector with shallow comparison
import { shallow } from 'zustand/shallow'

const { items, totalPrice } = useCartStore(
  (s) => ({ items: s.items, totalPrice: s.totalPrice() }),
  shallow,
)
```

### Middleware

```tsx
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light' as Theme,
        language: 'en',
        setTheme: (theme: Theme) => set({ theme }),
        setLanguage: (lang: string) => set({ language: lang }),
      }),
      {
        name: 'settings-storage', // localStorage key
        partialize: (state) => ({ theme: state.theme, language: state.language }),
      },
    ),
    { name: 'settings' }, // devtools label
  ),
)
```

### Slices Pattern (Large Stores)

```tsx
type UserSlice = { user: User | null; setUser: (user: User | null) => void }
type UISlice = { sidebarOpen: boolean; toggleSidebar: () => void }

const createUserSlice: StateCreator<UserSlice & UISlice, [], [], UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
})

const createUISlice: StateCreator<UserSlice & UISlice, [], [], UISlice> = (set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
})

const useStore = create<UserSlice & UISlice>()((...a) => ({
  ...createUserSlice(...a),
  ...createUISlice(...a),
}))
```

## TanStack Query

### Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 minute before considered stale
      gcTime: 5 * 60 * 1000,      // 5 minutes in garbage collection
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* app */}
    </QueryClientProvider>
  )
}
```

### Queries

```tsx
// Basic query
const { data, isLoading, error, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
})

// Query with parameters (auto-refetches when params change)
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // Only fetch when userId exists
})

// Paginated query
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam }),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Dependent query (fetch comments only after post loads)
const { data: post } = useQuery({ queryKey: ['post', id], queryFn: () => fetchPost(id) })
const { data: comments } = useQuery({
  queryKey: ['comments', post?.id],
  queryFn: () => fetchComments(post!.id),
  enabled: !!post?.id,
})
```

### Mutations

```tsx
const queryClient = useQueryClient()

const createUser = useMutation({
  mutationFn: (newUser: CreateUserInput) => api.createUser(newUser),
  onSuccess: (data) => {
    // Invalidate list to refetch
    queryClient.invalidateQueries({ queryKey: ['users'] })
    // Or update cache directly
    queryClient.setQueryData(['users'], (old: User[]) => [...old, data])
  },
})

// Usage
createUser.mutate({ name: 'Jane', email: 'jane@example.com' })
```

### Optimistic Updates

```tsx
const updateUser = useMutation({
  mutationFn: (updated: User) => api.updateUser(updated),
  onMutate: async (newData) => {
    // Cancel in-flight queries to prevent overwrite
    await queryClient.cancelQueries({ queryKey: ['users'] })

    // Snapshot current data for rollback
    const previousUsers = queryClient.getQueryData<User[]>(['users'])

    // Optimistically update cache
    queryClient.setQueryData<User[]>(['users'], (old) =>
      old?.map(u => u.id === newData.id ? newData : u) ?? []
    )

    // Return context for rollback
    return { previousUsers }
  },
  onError: (_err, _vars, context) => {
    // Rollback on error
    if (context?.previousUsers) {
      queryClient.setQueryData(['users'], context.previousUsers)
    }
  },
  onSettled: () => {
    // Always refetch after mutation (success or error)
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

### Query Key Factory

```tsx
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Usage
useQuery({ queryKey: userKeys.detail(userId), queryFn: () => fetchUser(userId) })

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all })

// Invalidate just lists
queryClient.invalidateQueries({ queryKey: userKeys.lists() })
```

## React Hook Form + Zod

### Basic Form

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
})

type FormValues = z.infer<typeof schema>

function UserForm({ onSubmit }: { onSubmit: (data: FormValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: undefined },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <input
          id="name"
          {...register('name')}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="flex h-10 w-full rounded-lg border px-3 text-sm"
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Similar for email and role */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### Field Arrays

```tsx
const schema = z.object({
  name: z.string().min(1),
  addresses: z.array(z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    zip: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  })).min(1, 'At least one address is required'),
})

function AddressForm() {
  const { control, register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', addresses: [{ street: '', city: '', zip: '' }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`addresses.${index}.street`)} placeholder="Street" />
          <input {...register(`addresses.${index}.city`)} placeholder="City" />
          <input {...register(`addresses.${index}.zip`)} placeholder="ZIP" />
          {fields.length > 1 && (
            <button type="button" onClick={() => remove(index)}>Remove</button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => append({ street: '', city: '', zip: '' })}>
        Add Address
      </button>
    </form>
  )
}
```

### Server Action Integration (Next.js)

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUser } from '@/app/actions/users'

function CreateUserForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormValues) {
    const result = await createUser(data)
    if (result.error) {
      // Set server-side errors on specific fields
      form.setError('email', { message: result.error })
      return
    }
    // Success handling
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>
}
```

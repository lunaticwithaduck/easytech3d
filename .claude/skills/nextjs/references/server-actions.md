# Server Actions

Form actions, progressive enhancement, validation, optimistic updates, and file uploads.

## Basic Server Action

```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await db.posts.create({ data: { title, content } })
  revalidatePath('/blog')
}
```

### In a Form (Progressive Enhancement)

```tsx
// app/blog/new/page.tsx — Server Component
import { createPost } from '@/app/actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

This works without JavaScript (progressive enhancement). The form submits as a standard HTML form and the Server Action handles it.

## Validated Server Action

```tsx
// app/actions/users.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
})

type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
  message?: string
}

export async function createUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  }

  const result = createUserSchema.safeParse(raw)

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    }
  }

  try {
    await db.users.create({ data: result.data })
  } catch (e) {
    if (e.code === 'P2002') {
      return { success: false, errors: { email: ['Email already exists'] } }
    }
    return { success: false, message: 'Failed to create user' }
  }

  revalidatePath('/users')
  redirect('/users')
}
```

### Client Form with useActionState

```tsx
'use client'

import { useActionState } from 'react'
import { createUser } from '@/app/actions/users'

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, {
    success: false,
  })

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <div className="rounded-lg border-destructive/50 bg-destructive/10 p-3" role="alert">
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <input
          id="name"
          name="name"
          required
          aria-invalid={!!state.errors?.name}
          className="flex h-10 w-full rounded-lg border px-3 text-sm"
        />
        {state.errors?.name && (
          <p className="text-sm text-destructive" role="alert">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={!!state.errors?.email}
          className="flex h-10 w-full rounded-lg border px-3 text-sm"
        />
        {state.errors?.email && (
          <p className="text-sm text-destructive" role="alert">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium">Role</label>
        <select id="role" name="role" required className="flex h-10 w-full rounded-lg border px-3 text-sm">
          <option value="">Select role...</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        {state.errors?.role && (
          <p className="text-sm text-destructive" role="alert">{state.errors.role[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
```

## Optimistic Updates with useOptimistic

```tsx
'use client'

import { useOptimistic } from 'react'
import { toggleTodo } from '@/app/actions/todos'

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state: Todo[], updatedId: string) =>
      state.map(todo =>
        todo.id === updatedId ? { ...todo, completed: !todo.completed } : todo
      ),
  )

  async function handleToggle(id: string) {
    addOptimistic(id)       // Instantly update UI
    await toggleTodo(id)    // Server action (may take time)
  }

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id}>
          <button onClick={() => handleToggle(todo.id)}>
            {todo.completed ? '✓' : '○'} {todo.title}
          </button>
        </li>
      ))}
    </ul>
  )
}
```

## File Upload

```tsx
// app/actions/upload.ts
'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  // Validate
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) return { error: 'File too large (max 5MB)' }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) return { error: 'Invalid file type' }

  // Save
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name}`
  const path = join(process.cwd(), 'public', 'uploads', filename)
  await writeFile(path, buffer)

  return { url: `/uploads/${filename}` }
}
```

```tsx
// Client component
'use client'

export function UploadForm() {
  const [preview, setPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <form action={uploadFile}>
      <input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      {preview && <img src={preview} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />}
      <button type="submit">Upload</button>
    </form>
  )
}
```

## Server Action Patterns

### Calling from Event Handlers

```tsx
'use client'

import { deletePost } from '@/app/actions/posts'

function DeleteButton({ postId }: { postId: string }) {
  async function handleDelete() {
    if (!confirm('Are you sure?')) return
    await deletePost(postId)
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

### With React Hook Form

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfile } from '@/app/actions/profile'

function ProfileForm({ user }: { user: User }) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, bio: user.bio },
  })

  async function onSubmit(data: ProfileInput) {
    const result = await updateProfile(data)
    if (result.error) {
      form.setError('root', { message: result.error })
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields */}</form>
}
```

## Security

```tsx
'use server'

import { auth } from '@/lib/auth'

export async function deletePost(postId: string) {
  // Always verify auth in Server Actions
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  // Verify ownership
  const post = await db.posts.findUnique({ where: { id: postId } })
  if (post?.authorId !== session.userId) throw new Error('Forbidden')

  await db.posts.delete({ where: { id: postId } })
  revalidatePath('/blog')
}
```

**Rules:**
- Always validate and sanitize input (treat Server Actions like API endpoints)
- Always verify authentication and authorization
- Use Zod for input validation
- Rate limit Server Actions in production
- Server Actions are exposed as POST endpoints — they're public
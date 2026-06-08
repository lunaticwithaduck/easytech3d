# Example: CRUD Pattern

Complete list + detail + create/edit + delete with Server Actions, validation, and cache invalidation.

## File Structure

```
app/
├── users/
│   ├── page.tsx              ← List (/users)
│   ├── new/page.tsx          ← Create (/users/new)
│   ├── [id]/
│   │   ├── page.tsx          ← Detail (/users/:id)
│   │   └── edit/page.tsx     ← Edit (/users/:id/edit)
│   └── loading.tsx           ← Skeleton for the segment
├── actions/
│   └── users.ts              ← Server Actions
└── components/
    └── UserForm.tsx           ← Shared form (create + edit)
```

## Server Actions

```tsx
// app/actions/users.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
})

type ActionResult = {
  success: boolean
  errors?: Record<string, string[]>
  message?: string
}

export async function createUser(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const result = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  try {
    await db.users.create({ data: result.data })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { success: false, errors: { email: ['Email already exists'] } }
    }
    return { success: false, message: 'Failed to create user' }
  }

  revalidatePath('/users')
  redirect('/users')
}

export async function updateUser(id: string, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const result = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  })

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  try {
    await db.users.update({ where: { id }, data: result.data })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { success: false, errors: { email: ['Email already exists'] } }
    }
    return { success: false, message: 'Failed to update user' }
  }

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
  redirect(`/users/${id}`)
}

export async function deleteUser(id: string): Promise<void> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  await db.users.delete({ where: { id } })

  revalidatePath('/users')
  redirect('/users')
}
```

## List Page

```tsx
// app/users/page.tsx
import Link from 'next/link'
import { db } from '@/lib/db'

export const metadata = { title: 'Users' }

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { search, page: pageStr } = await searchParams
  const page = Number(pageStr ?? '1')
  const perPage = 10

  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}

  const [users, total] = await Promise.all([
    db.users.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    db.users.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link
          href="/users/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add User
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search users..."
          className="h-10 w-64 rounded-lg border px-3 text-sm"
          aria-label="Search users"
        />
        <button type="submit" className="h-10 rounded-lg border px-4 text-sm">Search</button>
      </form>

      {/* Table */}
      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <table className="w-full rounded-xl border">
          <thead>
            <tr className="border-b bg-muted/50">
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">
                  <Link href={`/users/${user.id}`} className="hover:underline">{user.name}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 text-sm capitalize">{user.role}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/users/${user.id}/edit`} className="text-sm text-primary hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/users?page=${page - 1}`} className="rounded border px-3 py-1">Previous</Link>}
            {page < totalPages && <Link href={`/users?page=${page + 1}`} className="rounded border px-3 py-1">Next</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
```

## Detail Page

```tsx
// app/users/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { DeleteUserButton } from './DeleteUserButton'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await db.users.findUnique({ where: { id } })
  return { title: user?.name ?? 'User Not Found' }
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await db.users.findUnique({ where: { id } })
  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <div className="flex gap-2">
          <Link href={`/users/${id}/edit`} className="rounded-lg border px-4 py-2 text-sm">Edit</Link>
          <DeleteUserButton userId={id} userName={user.name} />
        </div>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="mt-1">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Role</dt>
          <dd className="mt-1 capitalize">{user.role}</dd>
        </div>
      </dl>
    </div>
  )
}
```

```tsx
// app/users/[id]/DeleteUserButton.tsx
'use client'

import { deleteUser } from '@/app/actions/users'

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  async function handleDelete() {
    if (!confirm(`Delete ${userName}? This cannot be undone.`)) return
    await deleteUser(userId)
  }

  return (
    <button onClick={handleDelete} className="rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground">
      Delete
    </button>
  )
}
```

## Key Patterns

1. **Server Actions** handle all mutations with Zod validation
2. **Auth checks** in every Server Action (treat them like API endpoints)
3. **`revalidatePath`** after every mutation to keep UI fresh
4. **`redirect`** after successful mutations for clean UX
5. **Search via URL params** — SEO-friendly, shareable, works without JS
6. **Pagination** via URL params with server-side database queries
7. **`notFound()`** for missing resources (renders `not-found.tsx`)
8. **`generateMetadata`** for dynamic page titles
9. **Client component only for interactive parts** (DeleteUserButton)
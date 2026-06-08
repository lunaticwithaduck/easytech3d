# Example: Auth Pattern

Middleware + session management + protected routes + role-based access.

## Session Management

```tsx
// lib/auth.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

type Session = {
  userId: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  expiresAt: number
}

export async function createSession(user: { id: string; email: string; role: string }) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.expiresAt as number < Date.now()) return null
    return payload as unknown as Session
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// Convenience: get session or throw
export async function auth() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}
```

## Middleware (Route Protection)

```tsx
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

// Routes that require authentication
const protectedPaths = ['/dashboard', '/settings', '/admin']
// Routes only for unauthenticated users
const authPaths = ['/login', '/register']
// Routes that require admin role
const adminPaths = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value

  // Verify token
  let session: { role: string } | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret)
      session = payload as { role: string }
    } catch {
      // Invalid token — clear it
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  const isAuthenticated = !!session
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPage = authPaths.some(p => pathname.startsWith(p))
  const isAdminPage = adminPaths.some(p => pathname.startsWith(p))

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin role check
  if (isAdminPage && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
}
```

## Login Server Action

```tsx
// app/actions/auth.ts
'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginState = {
  success: boolean
  errors?: Record<string, string[]>
  message?: string
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  const user = await db.users.findUnique({ where: { email: result.data.email } })

  if (!user || !await bcrypt.compare(result.data.password, user.passwordHash)) {
    return { success: false, message: 'Invalid email or password' }
  }

  await createSession({ id: user.id, email: user.email, role: user.role })

  const callbackUrl = formData.get('callbackUrl') as string
  redirect(callbackUrl || '/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
```

## Login Page

```tsx
// app/login/page.tsx
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Log In' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}
```

```tsx
// app/login/LoginForm.tsx
'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(login, { success: false })

  return (
    <form action={formAction} className="space-y-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

      {state.message && (
        <div className="rounded-lg bg-destructive/10 p-3" role="alert">
          <p className="text-sm text-destructive">{state.message}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={!!state.errors?.email}
          className="flex h-10 w-full rounded-lg border px-3 text-sm"
        />
        {state.errors?.email && (
          <p className="text-sm text-destructive" role="alert">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="flex h-10 w-full rounded-lg border px-3 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

## Protected Server Component

```tsx
// app/dashboard/page.tsx
import { auth } from '@/lib/auth'

export default async function Dashboard() {
  const session = await auth() // Throws if not authenticated

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.email}</p>
      {session.role === 'admin' && <AdminPanel />}
    </div>
  )
}
```

## Role-Based Component

```tsx
// components/RoleGate.tsx
import { getSession } from '@/lib/auth'

export async function RoleGate({
  allowedRoles,
  children,
  fallback,
}: {
  allowedRoles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const session = await getSession()
  if (!session || !allowedRoles.includes(session.role)) {
    return fallback ?? null
  }
  return <>{children}</>
}

// Usage
<RoleGate allowedRoles={['admin']}>
  <AdminTools />
</RoleGate>

<RoleGate allowedRoles={['admin', 'editor']} fallback={<p>You don't have permission</p>}>
  <ContentEditor />
</RoleGate>
```

## Key Patterns

1. **JWT in httpOnly cookie** — not accessible via JavaScript (XSS protection)
2. **Middleware** for route protection (runs on every request, fast)
3. **Server Action** for login (progressive enhancement, works without JS)
4. **`callbackUrl`** preserves intended destination through login flow
5. **Role checks** in middleware (admin routes) and components (RoleGate)
6. **Session verification** in every Server Action (defense in depth)
7. **Token rotation** — create new session on each login
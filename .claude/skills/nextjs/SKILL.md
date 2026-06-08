---
name: nextjs
description: This skill should be used when the user asks about "Next.js", "App Router", "Server Components", "Server Actions", "generateMetadata", "generateStaticParams", "ISR", "SSR", "SSG", "Next.js routing", "Next.js middleware", "Next.js caching", "revalidatePath", "revalidateTag", "next/image", "next/font", "next/link", "next.config", "Vercel deployment", or needs Next.js-specific development knowledge.
keywords:
  - Next.js
  - App Router
  - Server Components
  - Server Actions
  - generateMetadata
  - generateStaticParams
  - ISR
  - SSR
  - SSG
  - Next.js routing
  - Next.js middleware
  - Next.js caching
  - revalidatePath
  - revalidateTag
  - next/image
  - next/font
  - next/link
  - layout.tsx
  - page.tsx
  - loading.tsx
  - error.tsx
  - not-found.tsx
  - route.tsx
  - Vercel
---

# Next.js Skill

Next.js App Router patterns, rendering strategies, data fetching, caching, and deployment. Extends the `react` skill with Next.js expertise.

## App Router Mental Model

```
app/
├── layout.tsx          ← Root layout (wraps ALL pages, renders once)
├── page.tsx            ← Home page (/)
├── loading.tsx         ← Suspense fallback for this segment
├── error.tsx           ← Error boundary for this segment ("use client")
├── not-found.tsx       ← 404 page
├── globals.css
├── (marketing)/        ← Route group (no URL segment)
│   ├── layout.tsx      ← Marketing-specific layout
│   ├── about/page.tsx  ← /about
│   └── pricing/page.tsx← /pricing
├── dashboard/
│   ├── layout.tsx      ← Dashboard layout (sidebar, etc.)
│   ├── page.tsx        ← /dashboard
│   └── settings/
│       └── page.tsx    ← /dashboard/settings
├── blog/
│   ├── page.tsx        ← /blog (list)
│   └── [slug]/
│       └── page.tsx    ← /blog/:slug (detail)
└── api/
    └── webhooks/
        └── route.ts    ← API route handler
```

### "use client" Boundary Rule

```
Server Component (default)           Client Component ("use client")
├── Can fetch data directly          ├── Can use hooks (useState, useEffect)
├── Can access backend resources     ├── Can use event handlers
├── Can import Server Components     ├── Can use browser APIs
├── Cannot use hooks or events       ├── Cannot be async
└── Renders on server only           └── Renders on both server & client

RULE: "use client" creates a boundary. Everything imported into a Client
Component becomes client code. Push "use client" as far down as possible.
```

## Rendering Strategy Decision Tree

```
Does the page content change?
├── No → Static (default)
│   └── Built at build time, served from CDN
│
├── Yes, but infrequently (blog, products)?
│   └── ISR (Incremental Static Regeneration)
│       export const revalidate = 3600  // revalidate every hour
│
├── Yes, per user (dashboard, cart)?
│   └── Dynamic rendering
│       └── Use cookies(), headers(), or searchParams
│
├── Yes, needs real-time data?
│   └── Dynamic + client-side polling or WebSocket
│
└── Large page with mix of static and dynamic?
    └── Streaming with Suspense
    └── Static shell + <Suspense> around dynamic parts
```

## Data Fetching Patterns

### Server Component Fetch (Preferred)

```tsx
// app/blog/[slug]/page.tsx
async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetchPost(slug) // Direct async/await in component
  if (!post) notFound()

  return <article><h1>{post.title}</h1><div>{post.content}</div></article>
}
```

### Server Actions (Mutations)

```tsx
// app/actions/posts.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await db.posts.create({ data: { title, content } })
  revalidatePath('/blog')
}
```

### Route Handlers (REST API)

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')
  const users = await db.users.findMany({ where: { name: { contains: search } } })
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await db.users.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}
```

## Caching Architecture

| Layer | What | Default | Opt Out |
|-------|------|---------|---------|
| **Request Memoization** | Deduplicated fetch in same render | ON for same URL+options | `AbortController` |
| **Data Cache** | Server-side fetch results | ON (cached indefinitely) | `{ cache: 'no-store' }` or `revalidate: 0` |
| **Full Route Cache** | Pre-rendered HTML + RSC payload | ON for static routes | Dynamic functions or `revalidate: 0` |
| **Router Cache** | Client-side RSC payload | ON (30s auto, 5min manual) | `router.refresh()` or `revalidatePath()` |

### Cache Invalidation

```tsx
// Time-based
export const revalidate = 3600 // seconds (page or layout level)
fetch(url, { next: { revalidate: 3600 } }) // per-fetch

// On-demand
import { revalidatePath, revalidateTag } from 'next/cache'

revalidatePath('/blog')              // Revalidate specific path
revalidatePath('/blog/[slug]', 'page') // Revalidate dynamic page
revalidatePath('/', 'layout')        // Revalidate everything
revalidateTag('posts')               // Revalidate by tag

// Tag a fetch for on-demand revalidation
fetch(url, { next: { tags: ['posts'] } })
```

## Middleware

```tsx
// middleware.ts (project root)
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('session')?.value
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add headers
  const response = NextResponse.next()
  response.headers.set('x-pathname', request.nextUrl.pathname)
  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
```

### Common Middleware Patterns

| Pattern | Use Case |
|---------|----------|
| Auth redirect | Check session cookie, redirect to login |
| Role-based access | Check user role in JWT, redirect if unauthorized |
| Geo-redirect | Redirect based on `request.geo` |
| A/B testing | Set cookie with bucket, rewrite to variant |
| Rate limiting | Count requests in edge KV store |
| Bot detection | Check User-Agent, block or redirect |

## Error Handling

```
app/
├── error.tsx       ← Catches errors in this segment (must be "use client")
├── global-error.tsx← Catches root layout errors (must be "use client")
├── not-found.tsx   ← Triggered by notFound() or 404
└── loading.tsx     ← Suspense boundary for this segment
```

```tsx
// error.tsx — catches runtime errors
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

// not-found.tsx — custom 404
export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/">Go home</a>
    </div>
  )
}
```

## Metadata API

### Static Metadata

```tsx
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about our company and mission.',
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) return { title: 'Not Found' }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image] },
  }
}
```

### Root Layout Metadata

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: { default: 'My App', template: '%s | My App' },
  description: 'App description',
  openGraph: { siteName: 'My App', type: 'website' },
}
```

## Common Next.js Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| `"use client"` at top of page | Entire page is client-rendered, no SSR benefits | Push `"use client"` to leaf components |
| Fetching in Client Component | No server-side data, extra network roundtrip | Fetch in Server Component, pass as props |
| Not using `loading.tsx` | Blank screen during page transitions | Add `loading.tsx` with skeleton |
| Missing `error.tsx` | Unhandled errors crash the page | Add `error.tsx` with reset button |
| Forgetting `revalidatePath` after mutation | Stale data shown after create/update/delete | Call `revalidatePath()` in Server Action |
| Hardcoded URLs in metadata | URLs wrong in different environments | Use `metadataBase` in root layout |
| Not setting `key` on dynamic routes | Component state persists incorrectly between routes | Add unique key to trigger remount |
| Using `router.push` for simple links | No prefetch, slower navigation | Use `<Link href>` component |
| Giant root layout | Every page re-renders on navigation | Split layouts with route groups |
| `fetch` in `useEffect` for initial data | Flash of empty state, worse SEO | Server Component fetch or TanStack Query |

## References

- `~/.claude/skills/nextjs/references/app-router-patterns.md` — nested layouts, route groups, parallel routes, intercepting routes
- `~/.claude/skills/nextjs/references/data-fetching.md` — Server Component fetch, generateStaticParams, streaming, Suspense
- `~/.claude/skills/nextjs/references/caching-guide.md` — 4 caching layers, invalidation strategies, debugging, opting out
- `~/.claude/skills/nextjs/references/server-actions.md` — form actions, progressive enhancement, validation, file uploads
- `~/.claude/skills/nextjs/references/deployment-config.md` — next.config.js, env vars, Docker, Vercel vs self-hosted
- `~/.claude/skills/nextjs/examples/crud-pattern.md` — list + detail + create/edit + delete with Server Actions
- `~/.claude/skills/nextjs/examples/auth-pattern.md` — middleware + session + protected routes + role-based access
- `~/.claude/skills/nextjs/examples/dynamic-og-image.md` — ImageResponse with custom fonts + dynamic data
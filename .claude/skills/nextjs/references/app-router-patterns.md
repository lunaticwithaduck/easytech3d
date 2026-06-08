# App Router Patterns

Nested layouts, route groups, parallel routes, intercepting routes, and advanced routing.

## Nested Layouts

Layouts wrap their children and persist across navigations within their segment.

```
app/
├── layout.tsx              ← Root (always renders)
├── (auth)/
│   ├── layout.tsx          ← Auth layout (centered, no nav)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx          ← App layout (sidebar + nav)
│   ├── dashboard/page.tsx
│   └── settings/
│       ├── layout.tsx      ← Settings sub-layout (tabs)
│       ├── page.tsx        ← /settings (general)
│       ├── profile/page.tsx← /settings/profile
│       └── billing/page.tsx← /settings/billing
```

```tsx
// app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-[280px_1fr]">
      <Sidebar />
      <main className="p-6">{children}</main>
    </div>
  )
}

// app/(app)/settings/layout.tsx
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <nav className="mt-4 flex gap-4 border-b">
        <TabLink href="/settings">General</TabLink>
        <TabLink href="/settings/profile">Profile</TabLink>
        <TabLink href="/settings/billing">Billing</TabLink>
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  )
}
```

## Route Groups

Organize routes without affecting URL structure. Use `(groupName)` folder syntax.

```
app/
├── (marketing)/           ← No URL segment
│   ├── layout.tsx         ← Marketing layout (no sidebar)
│   ├── page.tsx           ← / (home)
│   ├── about/page.tsx     ← /about
│   └── pricing/page.tsx   ← /pricing
├── (app)/                 ← No URL segment
│   ├── layout.tsx         ← App layout (with sidebar)
│   ├── dashboard/page.tsx ← /dashboard
│   └── settings/page.tsx  ← /settings
```

**Use cases:**
- Different layouts for marketing vs. app sections
- Separate authenticated vs. public areas
- Organize features without changing URLs

## Dynamic Routes

```
app/
├── blog/
│   ├── page.tsx                    ← /blog
│   └── [slug]/                     ← /blog/:slug
│       └── page.tsx
├── shop/
│   └── [...categories]/            ← /shop/a, /shop/a/b, /shop/a/b/c
│       └── page.tsx
├── docs/
│   └── [[...slug]]/                ← /docs, /docs/a, /docs/a/b
│       └── page.tsx                ← (optional catch-all)
```

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) notFound()
  return <article>{/* ... */}</article>
}

// Pre-render known slugs at build time
export async function generateStaticParams() {
  const posts = await fetchAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}
```

## Parallel Routes

Render multiple pages simultaneously in the same layout using named slots.

```
app/
├── layout.tsx
├── page.tsx
├── @analytics/             ← Named slot
│   ├── page.tsx
│   └── loading.tsx
├── @team/                  ← Named slot
│   ├── page.tsx
│   └── loading.tsx
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {analytics}
        {team}
      </div>
    </div>
  )
}
```

**Key behaviors:**
- Each slot loads independently with its own `loading.tsx` and `error.tsx`
- Slots stream in as they resolve (automatic Suspense)
- Unmatched slots render `default.tsx` if present, or 404

### Conditional Slots (Auth Modal)

```
app/
├── layout.tsx
├── page.tsx
├── @auth/
│   ├── default.tsx         ← Renders nothing when no auth route matches
│   ├── login/page.tsx      ← /login (rendered in slot)
│   └── register/page.tsx   ← /register (rendered in slot)
```

```tsx
// app/layout.tsx
export default function Layout({
  children,
  auth,
}: {
  children: React.ReactNode
  auth: React.ReactNode
}) {
  return (
    <>
      {children}
      {auth} {/* Renders login/register as modal overlay */}
    </>
  )
}

// app/@auth/default.tsx
export default function AuthDefault() {
  return null // No modal when not on auth routes
}
```

## Intercepting Routes

Show a route in a different context (e.g., modal) while preserving the full-page version.

```
app/
├── feed/
│   ├── page.tsx                ← Feed page with photo grid
│   └── (..)photo/[id]/        ← Intercepts /photo/:id from feed
│       └── page.tsx            ← Shows photo as modal overlay
├── photo/
│   └── [id]/
│       └── page.tsx            ← Full photo page (direct URL access)
```

Convention: `(.)` same level, `(..)` one level up, `(..)(..)` two levels up, `(...)` root.

```tsx
// app/feed/(..)photo/[id]/page.tsx
export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const photo = await fetchPhoto(id)

  return (
    <dialog open className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-3xl rounded-xl bg-background p-6">
        <img src={photo.url} alt={photo.alt} />
        <p>{photo.caption}</p>
      </div>
    </dialog>
  )
}
```

**How it works:**
- Soft navigation from `/feed` → `/photo/123`: shows intercepted modal version
- Hard navigation (direct URL or refresh) to `/photo/123`: shows full page version
- Useful for: photo galleries, login modals, product previews

## Private Folders

Prefix with `_` to exclude from routing:

```
app/
├── _components/        ← Not a route, just organization
│   ├── Header.tsx
│   └── Footer.tsx
├── _lib/               ← Not a route
│   └── utils.ts
├── page.tsx
```

## Route Handlers

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const page = Number(searchParams.get('page') ?? '1')
  const users = await db.users.findMany({ skip: (page - 1) * 10, take: 10 })
  return NextResponse.json(users)
}

// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await db.users.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}

// app/api/users/[id]/route.ts
// GET /api/users/:id
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await db.users.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}
```

### Static vs Dynamic Route Handlers

```tsx
// Static (cached at build time) — no request object usage
export async function GET() {
  const data = await fetchStaticData()
  return NextResponse.json(data)
}

// Dynamic (runs on every request) — uses request, cookies, headers
export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')
  // ...
}

// Force dynamic
export const dynamic = 'force-dynamic'
```

## Loading and Streaming

```tsx
// app/dashboard/loading.tsx — automatic Suspense boundary
export default function DashboardLoading() {
  return <DashboardSkeleton />
}

// Manual Suspense for partial streaming
export default async function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Renders immediately */}
      <StaticContent />

      {/* Streams in when ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <SlowDataTable />
      </Suspense>
    </div>
  )
}
```

## Template vs Layout

```tsx
// layout.tsx — persists across navigations, state preserved
export default function Layout({ children }) {
  return <div>{children}</div> // Does NOT remount between pages
}

// template.tsx — creates new instance on each navigation
export default function Template({ children }) {
  return <div>{children}</div> // Remounts on every navigation
}
```

Use `template.tsx` when you need:
- Enter/exit animations per page
- Fresh state on each navigation (e.g., analytics page view)
- `useEffect` to run on every navigation
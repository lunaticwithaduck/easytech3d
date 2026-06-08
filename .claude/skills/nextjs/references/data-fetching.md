# Data Fetching in Next.js

Server Component fetch, generateStaticParams, streaming, and Suspense patterns.

## Server Component Fetch

Default and preferred pattern. Async components fetch data directly.

```tsx
// app/users/page.tsx — Server Component (default)
async function UsersPage() {
  const users = await db.users.findMany()

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### Fetch with Caching Options

```tsx
// Cached indefinitely (default in production)
const data = await fetch('https://api.example.com/data')

// Revalidate every 60 seconds (ISR)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
})

// No caching (always fresh)
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store',
})

// Tag-based revalidation
const data = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
})
// Later: revalidateTag('posts')
```

### Request Memoization

Fetch calls with the same URL and options are automatically deduplicated in the same render pass.

```tsx
// These two fetches are deduplicated — only one network request
async function Header() {
  const user = await fetchCurrentUser() // Request #1
  return <nav>{user.name}</nav>
}

async function Sidebar() {
  const user = await fetchCurrentUser() // Same request — reuses #1
  return <aside>{user.avatar}</aside>
}
```

**Only works for:**
- `fetch()` with same URL + options
- Same render pass (same request)
- GET requests only

## Parallel Data Fetching

```tsx
// Bad: sequential (waterfall)
async function Dashboard() {
  const user = await fetchUser()         // 200ms
  const posts = await fetchPosts()       // 300ms → total: 500ms
  const analytics = await fetchAnalytics() // 400ms → total: 900ms
  return <DashboardView user={user} posts={posts} analytics={analytics} />
}

// Good: parallel
async function Dashboard() {
  const [user, posts, analytics] = await Promise.all([
    fetchUser(),      // 200ms
    fetchPosts(),     // 300ms  → total: 400ms (max)
    fetchAnalytics(), // 400ms
  ])
  return <DashboardView user={user} posts={posts} analytics={analytics} />
}

// Best: streaming with Suspense (each section loads independently)
async function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo />   {/* Streams when ready */}
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />{/* Streams when ready */}
      </Suspense>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics />  {/* Streams when ready */}
      </Suspense>
    </div>
  )
}
```

## generateStaticParams

Pre-render dynamic routes at build time.

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await db.posts.findMany({ select: { slug: true } })
  return posts.map(post => ({ slug: post.slug }))
}

// Nested dynamic routes
// app/blog/[slug]/[comment]/page.tsx
export async function generateStaticParams() {
  const posts = await db.posts.findMany({ include: { comments: true } })
  return posts.flatMap(post =>
    post.comments.map(comment => ({
      slug: post.slug,
      comment: comment.id,
    }))
  )
}
```

### dynamicParams Control

```tsx
// Allow dynamic rendering for non-pre-rendered slugs (default: true)
export const dynamicParams = true

// Return 404 for non-pre-rendered slugs
export const dynamicParams = false
```

## Streaming and Suspense

### How Streaming Works

1. Server sends initial HTML shell immediately
2. Slow data resolves → server sends HTML chunk
3. Client React hydrates the chunk in place

```tsx
// The shell (layout + static content) renders immediately
// Each Suspense boundary streams when its data resolves
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div>
      {/* Immediate: static content */}
      <nav>Breadcrumbs</nav>

      {/* Stream 1: product details (fast API) */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails id={id} />
      </Suspense>

      {/* Stream 2: reviews (slow API) */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews id={id} />
      </Suspense>

      {/* Stream 3: recommendations (AI, very slow) */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations id={id} />
      </Suspense>
    </div>
  )
}

// Each component fetches its own data
async function ProductDetails({ id }: { id: string }) {
  const product = await fetchProduct(id)
  return <div>{product.name} — ${product.price}</div>
}

async function ProductReviews({ id }: { id: string }) {
  const reviews = await fetchReviews(id) // Slow: 2 seconds
  return <div>{reviews.map(r => <Review key={r.id} review={r} />)}</div>
}
```

### Loading UI Hierarchy

```
app/
├── layout.tsx          ← Root layout (never shows loading)
├── loading.tsx         ← Shows for ALL pages until first page renders
├── dashboard/
│   ├── loading.tsx     ← Shows until dashboard page renders
│   ├── page.tsx
│   └── analytics/
│       ├── loading.tsx ← Shows until analytics page renders
│       └── page.tsx
```

Each `loading.tsx` creates an automatic `<Suspense>` boundary.

## Fetching in Client Components

When you need client-side data fetching (real-time updates, user interactions):

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'

function LiveDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => fetch('/api/metrics').then(r => r.json()),
    refetchInterval: 5000, // Poll every 5 seconds
  })

  if (isLoading) return <Skeleton />
  return <MetricsChart data={data} />
}
```

### Server + Client Hybrid

```tsx
// Server Component — fetches initial data
async function UserDashboard() {
  const initialData = await fetchDashboardData()

  return (
    <div>
      <StaticHeader />
      {/* Client component receives server-fetched initial data */}
      <LiveMetrics initialData={initialData} />
    </div>
  )
}

// Client Component — takes over with real-time updates
'use client'
function LiveMetrics({ initialData }: { initialData: Metrics }) {
  const { data } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    initialData, // Avoids loading state on first render
    refetchInterval: 5000,
  })

  return <Chart data={data} />
}
```

## Data Fetching Patterns Summary

| Pattern | When | Caching |
|---------|------|---------|
| Server Component `async/await` | Initial page data | Server Data Cache |
| `fetch()` with `next: { revalidate }` | ISR content | Time-based |
| `fetch()` with `next: { tags }` | On-demand revalidation | Tag-based |
| Server Actions | Mutations | Revalidate after |
| Route Handlers | External API, webhooks | Configurable |
| TanStack Query (client) | Real-time, polling, optimistic | Client cache |
| `use()` hook | Unwrap promise from server | Depends on source |
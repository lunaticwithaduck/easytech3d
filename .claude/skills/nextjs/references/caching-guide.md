# Next.js Caching Guide

Four caching layers, invalidation strategies, debugging, and opting out.

## The Four Caching Layers

### 1. Request Memoization

**What:** Deduplicates `fetch()` calls with the same URL and options during a single server render.

```tsx
// Component A
const user = await fetch('/api/user/1').then(r => r.json())

// Component B (same render pass)
const user = await fetch('/api/user/1').then(r => r.json()) // Reuses Component A's result
```

**Duration:** Single server request (one page render)
**Opt out:** Use `AbortController` or different options

### 2. Data Cache

**What:** Persists `fetch()` results on the server across requests and deployments.

```tsx
// Cached indefinitely (default)
fetch('https://api.example.com/data')

// Revalidate every 60 seconds
fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
})

// Tag for on-demand revalidation
fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
})

// No caching
fetch('https://api.example.com/data', {
  cache: 'no-store',
})
```

**Duration:** Persistent (until revalidated or opted out)

**Opt out:**
```tsx
// Per-fetch
fetch(url, { cache: 'no-store' })

// Per-route segment
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Using dynamic functions (cookies, headers, searchParams)
// automatically opts out
```

### 3. Full Route Cache

**What:** Pre-renders static routes (HTML + RSC Payload) at build time. Served from CDN.

**Cached:** Routes with no dynamic functions, no uncached data fetching
**Not cached:** Routes using `cookies()`, `headers()`, `searchParams`, or `cache: 'no-store'`

```tsx
// Statically cached (no dynamic functions)
export default async function About() {
  return <div>About Us</div>
}

// NOT cached (uses cookies)
export default async function Dashboard() {
  const session = await cookies()
  return <div>Welcome, {session.get('name')}</div>
}
```

**Opt out:**
```tsx
export const dynamic = 'force-dynamic'
// or
export const revalidate = 0
```

### 4. Router Cache (Client-Side)

**What:** Caches RSC payload on the client for visited routes. Enables instant back/forward navigation.

**Duration:**
- Automatic prefetch (no prefetch prop): 30 seconds
- Full prefetch (`prefetch={true}`): 5 minutes
- `router.refresh()` or `revalidatePath()`: clears immediately

**Opt out:**
```tsx
// From a Server Action
revalidatePath('/dashboard')

// From a Client Component
const router = useRouter()
router.refresh() // Clears router cache for current route
```

## Invalidation Strategies

### Time-Based (ISR)

```tsx
// Page-level revalidation
export const revalidate = 3600 // seconds

// Per-fetch revalidation
const data = await fetch(url, {
  next: { revalidate: 60 },
})
```

**How it works:**
1. First request → serves cached version
2. After `revalidate` seconds → next request triggers background regeneration
3. Stale page served while regenerating
4. New page cached and served to subsequent requests

### On-Demand Revalidation

```tsx
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function createPost(data: PostInput) {
  await db.posts.create({ data })

  // Option 1: Revalidate specific path
  revalidatePath('/blog')

  // Option 2: Revalidate by tag
  revalidateTag('posts')

  // Option 3: Revalidate dynamic page
  revalidatePath(`/blog/${data.slug}`)

  // Option 4: Revalidate layout (and all child pages)
  revalidatePath('/', 'layout')
}
```

### Webhook Revalidation

```tsx
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  revalidateTag(body.tag) // e.g., 'products'

  return NextResponse.json({ revalidated: true })
}
```

## Debugging Caching

### Check What's Cached

```tsx
// next.config.js — enable logging
module.exports = {
  logging: {
    fetches: {
      fullUrl: true, // Log full fetch URLs
    },
  },
}
```

### Force Dynamic for Debugging

```tsx
// Temporarily force dynamic rendering to check for caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### Common Debugging Steps

1. **Page shows stale data:**
   - Check if `revalidatePath()` is called after mutations
   - Check if correct path/tag is used
   - Check Data Cache revalidation settings

2. **Page always re-renders (no caching):**
   - Check for dynamic functions (`cookies()`, `headers()`)
   - Check if `cache: 'no-store'` is set
   - Check if `dynamic = 'force-dynamic'` is set

3. **Client navigation shows old data:**
   - Router Cache may be serving stale payload
   - Call `router.refresh()` or `revalidatePath()` from Server Action

## unstable_cache (Database/ORM Queries)

For non-fetch data sources (database queries, ORM calls):

```tsx
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
  async (id: string) => {
    return db.users.findUnique({ where: { id } })
  },
  ['user'],              // Cache key prefix
  {
    tags: ['users'],     // For on-demand invalidation
    revalidate: 3600,    // Time-based revalidation
  },
)

// Usage
const user = await getCachedUser(userId)

// Invalidate
revalidateTag('users')
```

## Cache Summary Table

| Mechanism | Cache | Revalidate | Opt Out |
|-----------|-------|------------|---------|
| `fetch(url)` | Data Cache (persistent) | `revalidate: N`, `revalidateTag()` | `cache: 'no-store'` |
| `unstable_cache()` | Data Cache | `revalidate: N`, `revalidateTag()` | Don't wrap |
| Static page | Full Route Cache | `revalidate`, `revalidatePath()` | `dynamic = 'force-dynamic'` |
| `<Link>` prefetch | Router Cache (30s/5min) | `revalidatePath()` | `router.refresh()` |
| Same-request fetch | Request Memoization | N/A (single request) | `AbortController` |

## Common Patterns

### Cache Then Revalidate

```tsx
// Mutation → revalidate → redirect
'use server'

export async function updateProfile(formData: FormData) {
  await db.users.update({ where: { id: userId }, data: { name: formData.get('name') } })
  revalidatePath('/profile')
  redirect('/profile')
}
```

### Selective Caching

```tsx
// Mix cached and uncached data on same page
async function ProductPage({ params }) {
  // Cached: product details don't change often
  const product = await fetch(`/api/products/${params.id}`, {
    next: { revalidate: 3600 },
  })

  // Not cached: inventory changes frequently
  const inventory = await fetch(`/api/inventory/${params.id}`, {
    cache: 'no-store',
  })

  return <ProductView product={product} inventory={inventory} />
}
```
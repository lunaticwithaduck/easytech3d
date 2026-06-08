# Frontend Performance Guide

Core Web Vitals optimization, resource loading strategies, and performance patterns.

## Core Web Vitals Targets

| Metric | Good | Needs Work | Poor | What It Measures |
|--------|------|------------|------|-----------------|
| LCP | < 2.5s | 2.5–4.0s | > 4.0s | Loading (largest visible element) |
| INP | < 200ms | 200–500ms | > 500ms | Responsiveness (input delay) |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 | Visual stability (layout shifts) |

## LCP Optimization

### Identify LCP Element

Common LCP elements: hero image, large heading, background image, video poster.

### Resource Hints

```html
<!-- Preconnect to critical origins (fonts, CDN) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://cdn.example.com" crossorigin />

<!-- Preload LCP image -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />

<!-- Preload critical font -->
<link rel="preload" as="font" type="font/woff2" href="/inter-var.woff2" crossorigin />

<!-- DNS prefetch for non-critical origins -->
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

### Image Priority

```html
<!-- LCP image: eager load + high priority -->
<img src="hero.webp" alt="..." loading="eager" fetchpriority="high" decoding="async" />

<!-- Below fold: lazy load -->
<img src="card.webp" alt="..." loading="lazy" decoding="async" />
```

Next.js: `<Image priority />` on LCP image. Adds `fetchpriority="high"` and `loading="eager"`.

### Server Response Time

- Target TTFB < 800ms
- Use CDN for static assets
- Enable Brotli/gzip compression
- Use streaming SSR (`renderToPipeableStream`) or Next.js Streaming
- Cache database queries and API responses

## INP Optimization

### Break Up Long Tasks

```javascript
// Bad: blocks main thread
function processLargeList(items) {
  items.forEach(item => heavyComputation(item))
}

// Good: yield to main thread
async function processLargeList(items) {
  for (const item of items) {
    heavyComputation(item)
    // Yield every iteration to let browser process events
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

// Better: use scheduler.yield() (Chrome 115+)
async function processLargeList(items) {
  for (const item of items) {
    heavyComputation(item)
    if ('scheduler' in globalThis) {
      await scheduler.yield()
    }
  }
}
```

### Debounce and Throttle

```javascript
// Debounce: wait until user stops (search input)
function debounce(fn, ms = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// Throttle: max once per interval (scroll, resize)
function throttle(fn, ms = 100) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= ms) {
      last = now
      fn(...args)
    }
  }
}
```

### React-Specific INP

```tsx
// Use useTransition for non-urgent updates
const [isPending, startTransition] = useTransition()

function handleSearch(query: string) {
  // Urgent: update input immediately
  setSearchQuery(query)
  // Non-urgent: update results with lower priority
  startTransition(() => {
    setFilteredResults(filterResults(query))
  })
}

// Use useDeferredValue for expensive renders
const deferredQuery = useDeferredValue(searchQuery)
```

## CLS Optimization

### Always Set Dimensions

```html
<!-- Images: explicit width/height or aspect-ratio -->
<img src="photo.webp" alt="..." width="800" height="600" />

<!-- CSS: use aspect-ratio for responsive sizing -->
<style>
  .hero-image { aspect-ratio: 16 / 9; width: 100%; object-fit: cover; }
</style>

<!-- Embeds: reserve space -->
<div style="aspect-ratio: 16/9;">
  <iframe src="..." style="width:100%; height:100%;" loading="lazy"></iframe>
</div>
```

### Font Loading

```css
/* Prevent FOUT/FOIT layout shift */
@font-face {
  font-family: 'Inter';
  src: url('/inter.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately, swap when loaded */
  /* size-adjust reduces shift between fallback and web font */
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

Next.js: `next/font` handles this automatically with zero CLS.

### Prevent Dynamic Content Shifts

```css
/* Reserve space for dynamic content */
.ad-slot { min-height: 250px; }
.notification-bar { min-height: 48px; }

/* Contain layout shifts */
.dynamic-content { contain: layout; }
```

## Image Pipeline

### Format Selection

| Format | Use When | Browser Support |
|--------|----------|----------------|
| WebP | Default for photos and illustrations | 97%+ |
| AVIF | When max compression needed (hero images) | 92%+ |
| SVG | Icons, logos, simple illustrations | 100% |
| PNG | Screenshots, images needing transparency | 100% |

### Responsive Images

```html
<picture>
  <!-- AVIF for browsers that support it -->
  <source
    type="image/avif"
    srcset="hero-400.avif 400w, hero-800.avif 800w, hero-1200.avif 1200w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  />
  <!-- WebP fallback -->
  <source
    type="image/webp"
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  />
  <!-- Final fallback -->
  <img src="hero-800.jpg" alt="..." width="1200" height="675" loading="lazy" decoding="async" />
</picture>
```

## Code Splitting

### Dynamic Imports

```javascript
// Route-level splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

// Component-level splitting (heavy libraries)
const Chart = lazy(() => import('./components/Chart'))
const CodeEditor = lazy(() => import('./components/CodeEditor'))

// With Suspense boundary
<Suspense fallback={<Skeleton />}>
  <Chart data={data} />
</Suspense>
```

### Import Cost Awareness

```javascript
// Bad: imports entire library (300KB+)
import { format } from 'date-fns'

// Good: tree-shakeable import
import { format } from 'date-fns/format'

// Bad: full lodash
import _ from 'lodash'

// Good: individual function
import debounce from 'lodash/debounce'
```

## Web Workers

```javascript
// worker.js
self.addEventListener('message', (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
})

// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url))
worker.postMessage(largeData)
worker.addEventListener('message', (e) => {
  updateUI(e.data)
})
```

## Caching Strategies

### HTTP Cache Headers

| Strategy | Cache-Control | Use For |
|----------|--------------|---------|
| Immutable | `public, max-age=31536000, immutable` | Hashed assets (_next/static) |
| Stale-while-revalidate | `public, max-age=60, stale-while-revalidate=3600` | API responses, HTML |
| No cache | `no-cache, no-store, must-revalidate` | User-specific data, auth pages |

### Service Worker (Workbox)

```javascript
import { registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

// Cache images with CacheFirst
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } })
)

// Cache API with StaleWhileRevalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({ cacheName: 'api', expiration: { maxAgeSeconds: 5 * 60 } })
)
```

## Performance Measurement

```javascript
// Web Vitals library
import { onLCP, onINP, onCLS } from 'web-vitals'

onLCP(console.log)
onINP(console.log)
onCLS(console.log)

// Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`)
  }
})
observer.observe({ type: 'largest-contentful-paint', buffered: true })

// Custom timing
performance.mark('start-render')
// ... do work ...
performance.mark('end-render')
performance.measure('render-time', 'start-render', 'end-render')
```

## Performance Checklist

- [ ] LCP image has `fetchpriority="high"` and `loading="eager"`
- [ ] Below-fold images use `loading="lazy"`
- [ ] All images have explicit width/height or aspect-ratio
- [ ] Fonts use `font-display: swap` or `next/font`
- [ ] Critical CSS is inlined or loaded first
- [ ] JavaScript is code-split by route
- [ ] Third-party scripts are deferred or loaded async
- [ ] CDN serves static assets with immutable cache headers
- [ ] No render-blocking resources in `<head>`
- [ ] `preconnect` to critical third-party origins
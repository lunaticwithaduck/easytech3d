# Core Web Vitals

Deep optimization guide for LCP, INP, and CLS with Next.js-specific techniques.

## LCP (Largest Contentful Paint)

**Target:** < 2.5 seconds

LCP measures when the largest visible content element finishes rendering. Usually a hero image, heading, or video poster.

### What Counts as LCP

- `<img>` elements
- `<image>` inside SVG
- `<video>` poster image
- Elements with `background-image` via CSS
- Block-level text elements (`<h1>`, `<p>`, etc.)

### Optimization Strategies

**1. Preload the LCP resource:**
```tsx
// In root layout or page
export const metadata: Metadata = {
  other: {
    'link': [
      { rel: 'preload', href: '/hero.webp', as: 'image', type: 'image/webp' }
    ]
  }
}
```

**2. Use next/image with priority:**
```tsx
<Image src="/hero.webp" alt="Hero" width={1200} height={630} priority />
```
The `priority` prop adds `fetchpriority="high"` and preloads the image.

**3. Optimize server response time:**
- Use static generation (SSG) or ISR where possible
- Deploy at the edge (Vercel Edge, Cloudflare)
- Cache database queries
- Minimize Server Component render time

**4. Reduce render-blocking resources:**
- Inline critical CSS (Next.js does this automatically)
- Defer non-critical JavaScript
- Preconnect to required origins: `<link rel="preconnect" href="https://fonts.googleapis.com">`

**5. Optimize images:**
- Use AVIF or WebP format
- Size images to display dimensions (no 4000px images for 400px containers)
- Use responsive `srcset` and `sizes`

### Next.js Specific

- `next/image` automatically generates responsive images, lazy loads non-priority images, and serves modern formats
- Static pages (no dynamic functions) are pre-rendered at build time (fastest LCP)
- Use `loading.tsx` or `<Suspense>` to stream content progressively

## INP (Interaction to Next Paint)

**Target:** < 200 milliseconds

INP measures the delay between a user interaction (click, tap, key press) and the next visual update. Replaced FID in March 2024.

### Common Causes of Poor INP

1. **Long JavaScript tasks** blocking the main thread
2. **Heavy re-renders** triggered by state updates
3. **Synchronous layout calculations** (forced reflow)
4. **Third-party scripts** (analytics, ads, chat widgets)

### Optimization Strategies

**1. Break up long tasks:**
```tsx
// Yield to the main thread between chunks
async function processItems(items: Item[]) {
  for (const chunk of chunkArray(items, 50)) {
    await new Promise(resolve => setTimeout(resolve, 0)) // yield
    chunk.forEach(processItem)
  }
}
```

**2. Use React transitions for non-urgent updates:**
```tsx
import { useTransition } from 'react'

function SearchFilter({ onFilter }: { onFilter: (query: string) => void }) {
  const [isPending, startTransition] = useTransition()

  return (
    <input onChange={(e) => {
      startTransition(() => onFilter(e.target.value))
    }} />
  )
}
```

**3. Debounce expensive handlers:**
```tsx
const debouncedSearch = useMemo(
  () => debounce((query: string) => setSearchResults(search(query)), 300),
  []
)
```

**4. Use requestIdleCallback for non-critical work:**
```tsx
useEffect(() => {
  requestIdleCallback(() => {
    // Analytics, non-critical calculations
    trackPageView()
  })
}, [])
```

**5. Minimize third-party script impact:**
- Load analytics asynchronously
- Defer non-critical third-party scripts
- Use `<Script strategy="afterInteractive">` in Next.js

### Next.js Specific

- Server Components reduce client-side JavaScript (no hydration cost)
- `useTransition` for non-blocking state updates
- Dynamic imports with `next/dynamic` to code-split heavy components
- Streaming with Suspense to progressively render

## CLS (Cumulative Layout Shift)

**Target:** < 0.1

CLS measures visual stability. Layout shifts occur when visible elements move position unexpectedly.

### Common Causes

1. **Images without dimensions** (browser does not know size until loaded)
2. **Web fonts causing reflow** (FOIT/FOUT)
3. **Dynamically injected content** above existing content
4. **Ads or embeds** without reserved space

### Optimization Strategies

**1. Always set image dimensions:**
```tsx
// next/image handles this automatically
<Image src="/photo.jpg" alt="Photo" width={800} height={600} />

// For regular HTML images
<img src="/photo.jpg" alt="Photo" width="800" height="600" style={{ aspectRatio: '4/3' }} />
```

**2. Use aspect-ratio for responsive containers:**
```css
.video-container { aspect-ratio: 16 / 9; }
.card-image { aspect-ratio: 3 / 2; }
```

**3. Font loading strategy:**
```tsx
// next/font prevents font-swap CLS
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })
```

If not using next/font:
```css
@font-face {
  font-family: 'Custom';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Shows fallback immediately, swaps when loaded */
}
```

Use `font-display: optional` for non-critical fonts (prevents ALL layout shift but may not show custom font on slow connections).

**4. Reserve space for dynamic content:**
```css
/* Reserve space for an ad banner */
.ad-slot { min-height: 250px; }

/* Reserve space for a loading skeleton */
.skeleton { min-height: 200px; }
```

**5. Avoid inserting content above existing content:**
- Toast notifications should appear at top/bottom edges, not push content
- Banners should be part of the initial render or use reserved space
- Lazy-loaded content should have placeholders

### Next.js Specific

- `next/image` automatically handles image dimensions and prevents CLS
- `next/font` eliminates font-swap CLS
- `loading.tsx` skeleton should match the layout dimensions of the loaded content
- Use `<Suspense>` boundaries that match expected content size

## Measurement Tools

| Tool | Type | Best For |
|------|------|----------|
| Chrome DevTools (Performance tab) | Lab | Debugging specific issues |
| Lighthouse | Lab | Overall audit, scoring |
| PageSpeed Insights | Lab + Field | Google's recommended tool |
| Chrome UX Report (CrUX) | Field | Real user data |
| Google Search Console | Field | Site-wide CWV monitoring |
| web-vitals library | Field | Custom RUM collection |

### web-vitals Integration

```tsx
// app/components/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics
    console.log(metric.name, metric.value)
  })
  return null
}
```

## Quick Reference

| Metric | Good | Needs Work | Poor | Measures |
|--------|------|------------|------|----------|
| LCP | < 2.5s | < 4.0s | > 4.0s | Loading performance |
| INP | < 200ms | < 500ms | > 500ms | Interactivity |
| CLS | < 0.1 | < 0.25 | > 0.25 | Visual stability |

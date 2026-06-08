# Next.js SEO Patterns

Complete implementation guide for SEO in Next.js App Router. Covers the Metadata API, sitemaps, robots, Open Graph images, and all framework-specific patterns.

## Metadata API

### Static Metadata

Export a `metadata` object from `page.tsx` or `layout.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products | Acme Store',
  description: 'Browse our collection of premium products.',
  openGraph: {
    title: 'Products | Acme Store',
    description: 'Browse our collection of premium products.',
    url: 'https://acme.com/products',
    siteName: 'Acme Store',
    images: [{ url: '/og/products.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | Acme Store',
    description: 'Browse our collection of premium products.',
    images: ['/og/products.png'],
  },
  alternates: {
    canonical: 'https://acme.com/products',
  },
}
```

### Dynamic Metadata

Use `generateMetadata` for pages with dynamic content:

```tsx
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.name} | Acme Store`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 200),
      images: [{ url: product.image, width: 1200, height: 630 }],
      type: 'website',
    },
    alternates: {
      canonical: `https://acme.com/products/${slug}`,
    },
  }
}
```

### Root Layout Metadata

Set site-wide defaults in the root `layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://acme.com'),
  title: {
    default: 'Acme Store',
    template: '%s | Acme Store', // Pages override with just the page name
  },
  description: 'Premium products for everyone.',
  openGraph: {
    siteName: 'Acme Store',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@acmestore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}
```

With `title.template`, child pages only need:
```tsx
export const metadata: Metadata = {
  title: 'Products', // Renders as "Products | Acme Store"
}
```

## Sitemap

### Static Sitemap (`app/sitemap.ts`)

```tsx
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://acme.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://acme.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://acme.com/products', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]
}
```

### Dynamic Sitemap with Database Pages

```tsx
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({ select: { slug: true, updatedAt: true } })
  const posts = await db.post.findMany({ select: { slug: true, updatedAt: true } })

  const productUrls = products.map((p) => ({
    url: `https://acme.com/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const postUrls = posts.map((p) => ({
    url: `https://acme.com/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: 'https://acme.com', lastModified: new Date(), priority: 1 },
    ...productUrls,
    ...postUrls,
  ]
}
```

### Large Site Sitemap Index

For sites with 50,000+ URLs, split into multiple sitemaps:

```tsx
export async function generateSitemaps() {
  const count = await db.product.count()
  const sitemapCount = Math.ceil(count / 50000)
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    skip: id * 50000,
    take: 50000,
    select: { slug: true, updatedAt: true },
  })
  return products.map((p) => ({
    url: `https://acme.com/products/${p.slug}`,
    lastModified: p.updatedAt,
  }))
}
```

## Robots

### `app/robots.ts`

```tsx
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
    ],
    sitemap: 'https://acme.com/sitemap.xml',
  }
}
```

### Per-Page Noindex

```tsx
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}
```

Use noindex for:
- Internal search results pages
- Paginated archive pages (page 2+)
- Filtered/sorted variations
- Admin or account pages
- Thank you / confirmation pages

## Dynamic OG Images

### Route Handler (`app/api/og/route.tsx`)

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Acme Store'

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        padding: '60px 80px',
      }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 20 }}>
          acme.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

### Reference in Metadata

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  return {
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(product.name)}`],
    },
  }
}
```

## JSON-LD in App Router

Place JSON-LD in Server Components (page.tsx):

```tsx
import { JsonLd } from '@/components/json-ld'

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'USD',
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://acme.com' },
          { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://acme.com/products' },
          { '@type': 'ListItem', position: 3, name: product.name },
        ],
      }} />
      {/* Page content */}
    </>
  )
}
```

## generateStaticParams for SEO

Pre-render all SEO-critical pages at build time:

```tsx
export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } })
  return products.map((p) => ({ slug: p.slug }))
}
```

This ensures:
- Pages are pre-rendered (fastest LCP)
- Full Route Cache is populated
- Crawlers get instant responses

## Metadata Fields Reference

| Field | Purpose | Example |
|-------|---------|---------|
| `title` | Page title in browser tab and search results | `'Products \| Acme'` |
| `title.template` | Pattern for child pages | `'%s \| Acme'` |
| `description` | Search result snippet | 150-160 chars |
| `metadataBase` | Base URL for relative paths | `new URL('https://acme.com')` |
| `openGraph` | Facebook/LinkedIn sharing | title, description, images, type |
| `twitter` | Twitter/X sharing | card, title, description, images |
| `alternates.canonical` | Canonical URL | Absolute URL string |
| `alternates.languages` | Hreflang alternates | `{ 'en': '/en', 'de': '/de' }` |
| `robots` | Indexing directives | `{ index: true, follow: true }` |
| `icons` | Favicon and app icons | `{ icon: '/favicon.ico' }` |
| `manifest` | PWA manifest | `'/manifest.json'` |
| `verification` | Search console verification | `{ google: 'token' }` |

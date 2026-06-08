# Next.js App Router SEO Setup

Complete SEO implementation for a Next.js App Router application. Copy and adapt these files.

## Root Layout (`app/layout.tsx`)

```tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://acme.com'),
  title: {
    default: 'Acme Store - Premium Products',
    template: '%s | Acme Store',
  },
  description: 'Discover premium products at Acme Store. Free shipping on orders over $50.',
  openGraph: {
    siteName: 'Acme Store',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'Acme Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@acmestore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification-token',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

## Dynamic Page Metadata (`app/products/[slug]/page.tsx`)

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } })
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Acme Store`,
      description: product.description.slice(0, 200),
      images: [{ url: product.image, width: 1200, height: 630 }],
      type: 'website',
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        sku: product.sku,
        brand: { '@type': 'Brand', name: 'Acme' },
        offers: {
          '@type': 'Offer',
          url: `https://acme.com/products/${slug}`,
          priceCurrency: 'USD',
          price: product.price,
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
      <main>
        <h1>{product.name}</h1>
        {/* Product content */}
      </main>
    </>
  )
}
```

## Sitemap (`app/sitemap.ts`)

```tsx
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    select: { slug: true, updatedAt: true },
  })
  const posts = await db.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  })

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://acme.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://acme.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://acme.com/products', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://acme.com/blog', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ]

  const productPages = products.map((p) => ({
    url: `https://acme.com/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const postPages = posts.map((p) => ({
    url: `https://acme.com/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...postPages]
}
```

## Robots (`app/robots.ts`)

```tsx
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/account/'],
      },
    ],
    sitemap: 'https://acme.com/sitemap.xml',
  }
}
```

## JSON-LD Component (`components/json-ld.tsx`)

```tsx
export function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

## Organization Schema (Root Layout or About Page)

```tsx
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Acme Store',
  url: 'https://acme.com',
  logo: 'https://acme.com/logo.png',
  description: 'Premium products for everyone.',
  sameAs: [
    'https://twitter.com/acmestore',
    'https://github.com/acmestore',
    'https://linkedin.com/company/acmestore',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-123-4567',
    contactType: 'customer support',
    availableLanguage: 'English',
  },
}} />
```

## Not Found Page (`app/not-found.tsx`)

```tsx
import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
      <nav className="mt-8 flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/blog">Blog</Link>
      </nav>
    </main>
  )
}
```

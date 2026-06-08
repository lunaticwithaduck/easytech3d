# Example: Dynamic OG Image

ImageResponse with custom fonts, dynamic data, and integration with generateMetadata.

## OG Image Route Handler

```tsx
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') ?? 'Default Title'
  const description = searchParams.get('description') ?? ''
  const type = searchParams.get('type') ?? 'page' // page, blog, product

  // Load custom font
  const interBold = await fetch(
    new URL('../../public/fonts/Inter-Bold.ttf', import.meta.url)
  ).then(res => res.arrayBuffer())

  const interRegular = await fetch(
    new URL('../../public/fonts/Inter-Regular.ttf', import.meta.url)
  ).then(res => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'Inter',
        }}
      >
        {/* Top: Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            A
          </div>
          <span style={{ color: '#94a3b8', fontSize: '20px' }}>
            myapp.com
          </span>
          {type !== 'page' && (
            <span
              style={{
                background: '#1e40af',
                color: '#93c5fd',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 600,
                marginLeft: '8px',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </span>
          )}
        </div>

        {/* Center: Title + Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              fontSize: title.length > 40 ? '48px' : '56px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontSize: '24px',
                color: '#94a3b8',
                margin: 0,
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              {description.length > 100
                ? description.slice(0, 100) + '...'
                : description}
            </p>
          )}
        </div>

        {/* Bottom: Decorative */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#475569', fontSize: '16px' }}>
            Built with Next.js
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['#3b82f6', '#8b5cf6', '#06b6d4'].map((color) => (
              <div
                key={color}
                style={{
                  width: '32px',
                  height: '4px',
                  borderRadius: '2px',
                  background: color,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      ],
    },
  )
}
```

## Integration with generateMetadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) return { title: 'Not Found' }

  const ogImageUrl = new URL('/api/og', process.env.NEXT_PUBLIC_APP_URL)
  ogImageUrl.searchParams.set('title', post.title)
  ogImageUrl.searchParams.set('description', post.excerpt)
  ogImageUrl.searchParams.set('type', 'blog')

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl.toString()],
    },
  }
}
```

## Product OG Image Variant

```tsx
// app/api/og/product/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const name = searchParams.get('name') ?? 'Product'
  const price = searchParams.get('price') ?? ''
  const image = searchParams.get('image') ?? ''
  const rating = searchParams.get('rating') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'white',
          fontFamily: 'Inter',
        }}
      >
        {/* Product image (left half) */}
        {image && (
          <div style={{ width: '50%', height: '100%', display: 'flex' }}>
            <img
              src={image}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt=""
            />
          </div>
        )}

        {/* Product info (right half) */}
        <div
          style={{
            width: image ? '50%' : '100%',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '40px',
              fontWeight: 700,
              color: '#0f172a',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {name}
          </h1>

          {price && (
            <span
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#3b82f6',
              }}
            >
              {price}
            </span>
          )}

          {rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '24px',
                    color: i < Number(rating) ? '#f59e0b' : '#e2e8f0',
                  }}
                >
                  ★
                </span>
              ))}
              <span style={{ color: '#64748b', fontSize: '18px', marginLeft: '8px' }}>
                {rating}/5
              </span>
            </div>
          )}

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              A
            </div>
            <span style={{ color: '#64748b', fontSize: '16px' }}>myapp.com</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
```

## Key Patterns

1. **Edge runtime** for fast image generation (`export const runtime = 'edge'`)
2. **Custom fonts** loaded via `fetch()` for consistent branding
3. **Dynamic sizing** — title font size adjusts based on text length
4. **URL parameters** for flexibility — same route handles different content
5. **Integration with `generateMetadata`** — dynamic OG images per page
6. **1200x630 dimensions** — standard OG image size for all platforms
7. **Satori constraints** — uses flexbox (no grid), inline styles, limited CSS subset
8. **Multiple variants** — separate routes for blog posts, products, etc.
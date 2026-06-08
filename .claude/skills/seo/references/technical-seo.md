# Technical SEO

Deep reference for crawlability, indexing, URL structure, and technical foundations that enable search engines to discover and rank content.

## Crawl Budget

Search engines allocate a limited number of pages to crawl per visit. Optimize crawl budget by:

- **Eliminate duplicate content**: canonical tags, proper redirects, no parameter-based duplicates
- **Block low-value pages**: noindex on paginated archives, filtered views, internal search results
- **Fix broken links**: 404s waste crawl budget
- **Keep sitemap updated**: helps crawlers find new/changed pages efficiently
- **Reduce redirect chains**: each hop costs a crawl request

## robots.txt

```txt
# Allow all crawlers
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

# Sitemap reference
Sitemap: https://example.com/sitemap.xml
```

**Next.js implementation** (`app/robots.ts`):
```tsx
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

**Rules:**
- Never block CSS or JavaScript files (crawlers need them to render)
- Always reference the sitemap
- Use specific paths, not wildcards when possible
- Test with Google Search Console's robots.txt tester

## Canonical URLs

Canonical tags tell search engines which URL is the "official" version when content is accessible at multiple URLs.

```html
<link rel="canonical" href="https://example.com/products/widget" />
```

**When canonicals are essential:**
- Pages accessible with and without trailing slashes
- Pages accessible via multiple URL parameters
- HTTP and HTTPS versions
- www and non-www versions
- Paginated content pointing to page 1
- Mobile and desktop versions

**Next.js pattern:**
```tsx
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/products/widget',
  },
}
```

**Rules:**
- Always use absolute URLs (include domain)
- Self-referencing canonicals are valid and recommended
- Canonical should point to the preferred URL (usually the cleanest version)
- Do not canonical to a 404 or redirected URL

## Redirects

| Type | Status Code | Use When |
|------|------------|----------|
| Permanent | 301 | URL permanently moved, passes ~90% link equity |
| Temporary | 302 | URL temporarily unavailable, does NOT pass link equity |
| Permanent (alternative) | 308 | Same as 301 but preserves HTTP method |
| Temporary (alternative) | 307 | Same as 302 but preserves HTTP method |

**Redirect chains** (A -> B -> C): Avoid. Each hop loses link equity and wastes crawl budget. Redirect directly from A to C.

**Next.js redirects** (`next.config.ts`):
```tsx
const nextConfig = {
  async redirects() {
    return [
      { source: '/old-page', destination: '/new-page', permanent: true },
      { source: '/blog/:slug', destination: '/articles/:slug', permanent: true },
    ]
  },
}
```

## Hreflang (International SEO)

For multi-language sites, hreflang tells search engines which language version to show to users.

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
<link rel="alternate" hreflang="de" href="https://example.com/de/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

**Rules:**
- Include `x-default` for the fallback language
- Hreflang must be reciprocal (each page references all alternates including itself)
- Use ISO 639-1 language codes and optional ISO 3166-1 country codes

## XML Sitemap

**Next.js implementation** (`app/sitemap.ts`):
```tsx
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()

  const productUrls = products.map((product) => ({
    url: `https://example.com/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://example.com', lastModified: new Date(), priority: 1.0 },
    { url: 'https://example.com/about', priority: 0.5 },
    ...productUrls,
  ]
}
```

**For large sites (50,000+ URLs)**, use sitemap index:
```tsx
export async function generateSitemaps() {
  const totalProducts = await getProductCount()
  const sitemapCount = Math.ceil(totalProducts / 50000)
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }))
}
```

**Rules:**
- Maximum 50,000 URLs per sitemap file
- Maximum 50MB per sitemap file
- Include `lastModified` dates (actual dates, not always "today")
- Only include indexable pages (no noindex, no redirects, no 404s)
- Submit in Google Search Console after creation

## URL Structure

**Best practices:**
- Lowercase, hyphen-separated: `/products/blue-widget` not `/Products/Blue_Widget`
- Descriptive slugs: `/blog/seo-guide` not `/blog/post-123`
- Shallow hierarchy: `/category/product` not `/shop/all/clothing/men/shirts/blue`
- No trailing slashes (or be consistent with canonicals)
- No query parameters for content differentiation (use path segments)
- Keep URLs under 2048 characters (practical limit)

## Status Codes for SEO

| Code | Meaning | SEO Impact |
|------|---------|-----------|
| 200 | OK | Page is indexed |
| 301 | Permanent redirect | Passes link equity to target |
| 302 | Temporary redirect | Does NOT pass link equity |
| 404 | Not found | Page removed from index over time |
| 410 | Gone | Page removed from index faster than 404 |
| 500 | Server error | Temporary, but persistent 500s cause deindexing |
| 503 | Service unavailable | Tells crawlers to retry later |

## Crawl Optimization Checklist

- [ ] robots.txt allows all important content and resources
- [ ] XML sitemap exists and is submitted to Search Console
- [ ] No redirect chains longer than 2 hops
- [ ] All important pages return 200 status
- [ ] Canonical URLs set on every page (absolute URLs)
- [ ] No duplicate content without canonical resolution
- [ ] Internal links use proper anchor text
- [ ] Site loads over HTTPS with valid certificate
- [ ] URL structure is clean, descriptive, and consistent

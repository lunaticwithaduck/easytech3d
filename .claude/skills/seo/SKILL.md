---
name: seo
description: This skill should be used when the user asks about "SEO", "search engine optimization", "meta tags", "structured data", "sitemap", "robots.txt", "Core Web Vitals", "page speed", "Open Graph", "canonical URL", "SEO audit", "schema markup", "indexing", "JSON-LD", "generateMetadata", or needs SEO knowledge for web applications, especially Next.js.
version: 1.0.0
---

# SEO for Next.js Applications

Comprehensive SEO knowledge with Next.js-focused implementation patterns. Covers technical SEO, on-page optimization, structured data, Core Web Vitals, and social sharing. Includes Python audit scripts for automated analysis.

## SEO Audit Workflow

Follow these 6 phases in order for a complete audit. Skip phases only when the scope is narrower.

### Phase 1: Technical Crawlability

Check that search engines can discover and access content.

| Check | What to Look For | Severity |
|-------|-----------------|----------|
| robots.txt | Exists, does not block important paths, allows CSS/JS | Critical |
| Sitemap | sitemap.xml or sitemap.ts exists, includes all indexable pages | Critical |
| Canonical URLs | Every page has a canonical, no duplicates | Critical |
| Redirect chains | No chains > 2 hops, 301 for permanent moves | High |
| 404 handling | Custom not-found.tsx, proper status codes | Medium |
| HTTPS | All resources served over HTTPS | Critical |
| URL structure | Descriptive slugs, no query param dependency for content | Medium |

### Phase 2: On-Page SEO

Verify every page has proper metadata and content structure.

| Element | Requirements | Character Limits |
|---------|-------------|-----------------|
| Title tag | Unique per page, includes primary keyword, brand at end | 50-60 chars |
| Meta description | Unique, compelling, includes call-to-action | 150-160 chars |
| H1 | ONE per page, matches page topic, includes keyword | No hard limit |
| Heading hierarchy | Sequential (h1 > h2 > h3), no skips | - |
| Image alt text | Descriptive for meaningful images, empty for decorative | 125 chars |
| Internal links | Key pages linked from navigation, contextual cross-links | - |
| URL slug | Lowercase, hyphens, descriptive, no stop words | Keep short |

### Phase 3: Structured Data

Verify JSON-LD implementation for rich results eligibility.

| Schema Type | Use When | Required Properties |
|-------------|----------|-------------------|
| Article | Blog posts, news articles | headline, image, datePublished, author |
| Product | Product pages | name, image, offers (price, availability, currency) |
| FAQ | FAQ sections | mainEntity[].name, mainEntity[].acceptedAnswer.text |
| BreadcrumbList | Breadcrumb navigation | itemListElement[].name, .item, .position |
| Organization | About page, site-wide | name, url, logo, sameAs (social links) |
| LocalBusiness | Local business sites | name, address, telephone, openingHours |
| HowTo | Tutorial/guide pages | name, step[].name, step[].text |
| VideoObject | Video content | name, description, thumbnailUrl, uploadDate |
| Event | Event pages | name, startDate, location, offers |
| Review | Review content | itemReviewed, reviewRating, author |

### Phase 4: Performance (Core Web Vitals)

| Metric | Target | Key Optimizations |
|--------|--------|-------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Preload hero image, optimize server response, reduce render-blocking CSS/JS |
| INP (Interaction to Next Paint) | < 200ms | Reduce JS execution, debounce handlers, use `startTransition`, yield to main thread |
| CLS (Cumulative Layout Shift) | < 0.1 | Explicit image dimensions, font-display: swap, reserve space for dynamic content |

### Phase 5: Social and Sharing

| Tag | Purpose | Requirements |
|-----|---------|-------------|
| og:title | Social share title | Match or shorten page title |
| og:description | Social share description | Compelling summary, 200 chars |
| og:image | Social share image | 1200x630px, < 8MB |
| og:url | Canonical URL | Absolute URL |
| og:type | Content type | website, article, product |
| twitter:card | Twitter display | summary_large_image for image-heavy |
| twitter:creator | Author handle | @username |
| favicon set | Browser tabs, bookmarks | favicon.ico, apple-touch-icon, manifest icons |

### Phase 6: Indexing and Analytics

- Google Search Console connected and verified
- Analytics tracking installed (GA4, Plausible, etc.)
- Search Console sitemap submitted
- No unexpected noindex directives
- Core Web Vitals monitored in Search Console

## Next.js SEO Implementation

### Metadata API

```tsx
// Static metadata (page.tsx or layout.tsx)
export const metadata: Metadata = {
  title: 'Page Title | Brand',
  description: 'Page description under 160 chars.',
  openGraph: { title: '...', description: '...', images: ['/og-image.png'] },
}

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id)
  return {
    title: `${product.name} | Brand`,
    description: product.description.slice(0, 160),
    openGraph: { images: [product.image] },
  }
}
```

### Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root metadata (site-wide defaults, viewport, theme-color) |
| `app/sitemap.ts` | Dynamic sitemap generation |
| `app/robots.ts` | Robots.txt configuration |
| `app/manifest.ts` | PWA manifest |
| `app/api/og/route.tsx` | Dynamic OG image generation |
| `app/not-found.tsx` | Custom 404 page |

### JSON-LD Pattern

```tsx
// Reusable JSON-LD component
function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Usage in a page
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  image: article.image,
  datePublished: article.publishedAt,
  author: { '@type': 'Person', name: article.author },
}} />
```

## Python SEO Audit Scripts

Run automated audits from the command line:

```bash
# Full audit
python3 ~/.claude/skills/seo/scripts/audit.py <project-dir> --full

# Specific scans
python3 ~/.claude/skills/seo/scripts/audit.py <project-dir> --technical
python3 ~/.claude/skills/seo/scripts/audit.py <project-dir> --content
python3 ~/.claude/skills/seo/scripts/audit.py <project-dir> --structured-data
```

The audit scripts scan the codebase for:
- Missing or incomplete meta tags
- Heading hierarchy violations
- Missing image alt text
- JSON-LD validation issues
- Sitemap and robots.txt problems
- Internal linking analysis

## Common SEO Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| No canonical URLs | Duplicate content penalties | Add canonical to every page via metadata API |
| Client-rendered content without SSR | Content invisible to crawlers | Use Server Components or SSR for SEO content |
| Missing image dimensions | CLS issues, poor Core Web Vitals | Always set width/height on next/image |
| Same title/description on all pages | Poor click-through rates, indexing confusion | Unique metadata per page with generateMetadata |
| Blocking CSS/JS in robots.txt | Crawlers cannot render pages | Allow all rendering resources |
| No structured data | Missing rich results in search | Add JSON-LD for relevant schema types |
| Redirect chains | Wasted crawl budget, slower loads | Direct redirects (A to C, not A to B to C) |
| Missing alt text on meaningful images | Accessibility and image search penalty | Descriptive alt text on all non-decorative images |

## Pre-Delivery Checklist

- [ ] Every page has unique title (50-60 chars) and description (150-160 chars)
- [ ] robots.txt exists and does not block important content
- [ ] sitemap.xml/sitemap.ts includes all indexable pages
- [ ] Canonical URLs set on all pages
- [ ] JSON-LD structured data on key pages (at minimum: Organization, BreadcrumbList)
- [ ] Open Graph and Twitter Card tags on all pages
- [ ] All images have descriptive alt text
- [ ] Heading hierarchy is sequential (one H1, h2 > h3)
- [ ] Core Web Vitals targets met (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Custom 404 page with helpful navigation
- [ ] No redirect chains > 2 hops

## Additional Resources

Detailed references:
- `references/technical-seo.md` -- crawlability, indexing, URL structure
- `references/structured-data.md` -- complete JSON-LD reference for all schema types
- `references/core-web-vitals.md` -- deep optimization guide
- `references/nextjs-seo-patterns.md` -- Next.js-specific implementation
- `references/content-seo.md` -- title formulas, descriptions, content strategy

Working examples:
- `examples/nextjs-seo-setup.md` -- complete App Router SEO setup
- `examples/structured-data-templates.md` -- copy-paste JSON-LD templates

Audit tools:
- `scripts/audit.py` -- automated SEO audit CLI
- `scripts/analyzers.py` -- analysis modules

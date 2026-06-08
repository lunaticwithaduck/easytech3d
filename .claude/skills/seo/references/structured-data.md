# Structured Data (JSON-LD)

Complete reference for implementing JSON-LD structured data. Covers all common schema types with required and recommended properties, validation rules, and Next.js implementation patterns.

## Implementation Pattern

Always use JSON-LD format (recommended by Google over Microdata or RDFa).

### Reusable Component

```tsx
function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

Place JSON-LD in the page component (Server Component), not in layout.

### Placement Rules

- One or more JSON-LD blocks per page is fine
- Place in the `<head>` or `<body>` (both valid)
- Must be valid JSON (no trailing commas, proper escaping)
- Use absolute URLs for all URL properties
- Use ISO 8601 format for dates: `2024-01-15T10:30:00Z`

## Schema Types

### Article

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Optimize Your Next.js App for SEO",
  "image": "https://example.com/images/seo-guide.jpg",
  "datePublished": "2024-01-15T10:00:00Z",
  "dateModified": "2024-02-01T14:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://example.com/authors/jane-doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Inc",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "description": "A comprehensive guide to optimizing Next.js applications for search engines.",
  "mainEntityOfPage": "https://example.com/blog/nextjs-seo-guide"
}
```

**Required:** headline, image, datePublished, author
**Recommended:** dateModified, publisher, description, mainEntityOfPage

### Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Widget",
  "image": ["https://example.com/widget-1.jpg", "https://example.com/widget-2.jpg"],
  "description": "High-quality widget for professional use.",
  "sku": "WDG-001",
  "brand": {
    "@type": "Brand",
    "name": "WidgetCo"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/premium-widget",
    "priceCurrency": "USD",
    "price": "49.99",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2025-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
```

**Required:** name, image, offers (price, priceCurrency, availability)
**Recommended:** brand, sku, aggregateRating, description, review

### FAQ

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is structured data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Structured data is a standardized format for providing information about a page to search engines."
      }
    },
    {
      "@type": "Question",
      "name": "Which format should I use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Google recommends JSON-LD format for structured data implementation."
      }
    }
  ]
}
```

**Required:** mainEntity[].name, mainEntity[].acceptedAnswer.text

### BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://example.com/products" },
    { "@type": "ListItem", "position": 3, "name": "Premium Widget" }
  ]
}
```

**Required:** itemListElement[].position, .name
**Note:** Last item should NOT have `item` URL (represents current page).

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Inc",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "We build amazing products.",
  "sameAs": [
    "https://twitter.com/example",
    "https://github.com/example",
    "https://linkedin.com/company/example"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-123-4567",
    "contactType": "customer support"
  }
}
```

**Required:** name, url
**Recommended:** logo, sameAs, description, contactPoint

### LocalBusiness

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Example Coffee Shop",
  "image": "https://example.com/storefront.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Springfield",
    "addressRegion": "IL",
    "postalCode": "62701",
    "addressCountry": "US"
  },
  "telephone": "+1-555-123-4567",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "19:00"
    }
  ],
  "priceRange": "$$",
  "geo": { "@type": "GeoCoordinates", "latitude": 39.7817, "longitude": -89.6501 }
}
```

**Required:** name, address
**Recommended:** telephone, openingHoursSpecification, geo, image, priceRange

### HowTo

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up SEO in Next.js",
  "description": "Step-by-step guide to implementing SEO in a Next.js application.",
  "totalTime": "PT30M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Create metadata",
      "text": "Add a metadata export to your root layout.tsx file.",
      "url": "https://example.com/guide#step1"
    },
    {
      "@type": "HowToStep",
      "name": "Add sitemap",
      "text": "Create app/sitemap.ts to generate your XML sitemap.",
      "url": "https://example.com/guide#step2"
    }
  ]
}
```

**Required:** name, step[].text
**Recommended:** description, totalTime, step[].name, step[].url, step[].image

### VideoObject

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Next.js SEO Tutorial",
  "description": "Learn how to optimize your Next.js app for search engines.",
  "thumbnailUrl": "https://example.com/video-thumb.jpg",
  "uploadDate": "2024-01-15T10:00:00Z",
  "duration": "PT15M30S",
  "contentUrl": "https://example.com/videos/seo-tutorial.mp4",
  "embedUrl": "https://www.youtube.com/embed/abc123"
}
```

**Required:** name, description, thumbnailUrl, uploadDate
**Recommended:** duration, contentUrl or embedUrl

## Nesting Schemas

Combine multiple schemas on a single page:

```tsx
// Page component
export default function ProductPage({ product }) {
  return (
    <>
      <JsonLd data={productSchema(product)} />
      <JsonLd data={breadcrumbSchema(product)} />
      <JsonLd data={organizationSchema()} />
      {/* Page content */}
    </>
  )
}
```

## Validation

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Validator**: https://validator.schema.org/
- **Google Search Console**: Rich results report for live monitoring

**Common Validation Errors:**
- Missing required properties
- Wrong data types (number as string, missing ISO dates)
- Relative URLs instead of absolute
- Invalid availability values (must use schema.org URL format)
- Mismatched @type for nested objects

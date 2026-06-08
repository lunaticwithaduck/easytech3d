# Structured Data Templates

Copy-paste JSON-LD templates for common schema types. Replace placeholder values with your actual data.

## TypeScript Helper

```tsx
// components/json-ld.tsx
export function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Type-safe schema builders
type SchemaOrg<T extends string> = {
  '@context': 'https://schema.org'
  '@type': T
  [key: string]: unknown
}

export function articleSchema(article: {
  title: string
  description: string
  image: string
  publishedAt: string
  updatedAt: string
  authorName: string
  authorUrl?: string
  url: string
}): SchemaOrg<'Article'> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
      ...(article.authorUrl && { url: article.authorUrl }),
    },
    mainEntityOfPage: article.url,
  }
}

export function productSchema(product: {
  name: string
  description: string
  images: string[]
  price: number
  currency?: string
  inStock: boolean
  sku?: string
  brand?: string
  url: string
  rating?: { value: number; count: number }
}): SchemaOrg<'Product'> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency ?? 'USD',
      price: product.price.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value.toString(),
        reviewCount: product.rating.count.toString(),
      },
    }),
  }
}

export function faqSchema(
  questions: Array<{ question: string; answer: string }>
): SchemaOrg<'FAQPage'> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

export function breadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): SchemaOrg<'BreadcrumbList'> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  }
}

export function organizationSchema(org: {
  name: string
  url: string
  logo: string
  description?: string
  socialLinks?: string[]
}): SchemaOrg<'Organization'> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    ...(org.description && { description: org.description }),
    ...(org.socialLinks && { sameAs: org.socialLinks }),
  }
}

export function localBusinessSchema(business: {
  name: string
  image?: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  hours: Array<{ days: string[]; opens: string; closes: string }>
  priceRange?: string
  lat?: number
  lng?: number
}): SchemaOrg<'LocalBusiness'> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    ...(business.image && { image: business.image }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.street,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.zip,
      addressCountry: business.country,
    },
    telephone: business.phone,
    ...(business.priceRange && { priceRange: business.priceRange }),
    ...(business.lat && business.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: business.lat, longitude: business.lng },
    }),
    openingHoursSpecification: business.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  }
}
```

## Usage Examples

### Blog Post Page

```tsx
import { articleSchema, breadcrumbSchema } from '@/components/json-ld'

export default function BlogPost({ post }) {
  return (
    <>
      <JsonLd data={articleSchema({
        title: post.title,
        description: post.excerpt,
        image: post.coverImage,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        authorName: post.author.name,
        authorUrl: `https://acme.com/authors/${post.author.slug}`,
        url: `https://acme.com/blog/${post.slug}`,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: 'https://acme.com' },
        { name: 'Blog', url: 'https://acme.com/blog' },
        { name: post.title },
      ])} />
      {/* Content */}
    </>
  )
}
```

### Product Page

```tsx
import { productSchema, breadcrumbSchema } from '@/components/json-ld'

export default function ProductPage({ product }) {
  return (
    <>
      <JsonLd data={productSchema({
        name: product.name,
        description: product.description,
        images: product.images,
        price: product.price,
        inStock: product.stock > 0,
        sku: product.sku,
        brand: product.brand,
        url: `https://acme.com/products/${product.slug}`,
        rating: product.reviewCount > 0
          ? { value: product.avgRating, count: product.reviewCount }
          : undefined,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: 'https://acme.com' },
        { name: 'Products', url: 'https://acme.com/products' },
        { name: product.category, url: `https://acme.com/products?category=${product.categorySlug}` },
        { name: product.name },
      ])} />
      {/* Content */}
    </>
  )
}
```

### FAQ Page

```tsx
import { faqSchema } from '@/components/json-ld'

const faqs = [
  { question: 'What is your return policy?', answer: 'We offer 30-day returns on all products.' },
  { question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries worldwide.' },
  { question: 'How long does shipping take?', answer: 'Standard shipping takes 5-7 business days.' },
]

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <main>
        <h1>Frequently Asked Questions</h1>
        {faqs.map((faq) => (
          <section key={faq.question}>
            <h2>{faq.question}</h2>
            <p>{faq.answer}</p>
          </section>
        ))}
      </main>
    </>
  )
}
```

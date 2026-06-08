# Content SEO

Title tag formulas, meta description patterns, heading hierarchy for SEO, keyword placement, internal linking architecture, and content freshness signals.

## Title Tags

### Formulas

| Pattern | Example | Best For |
|---------|---------|----------|
| Primary Keyword - Brand | `SEO Guide - Acme Blog` | Blog posts, articles |
| Product Name \| Category \| Brand | `Blue Widget \| Widgets \| Acme Store` | Product pages |
| Action + Keyword + Year | `How to Optimize SEO in 2024` | Tutorials, guides |
| Number + Keyword + Modifier | `10 Best SEO Tools (Free & Paid)` | Listicles |
| Keyword: Subtitle | `Next.js SEO: The Complete Guide` | Long-form content |
| Location + Service | `Web Design Agency in Sofia` | Local business |

### Rules

- **Length:** 50-60 characters (Google truncates at ~600px width)
- **Keyword placement:** Primary keyword near the beginning
- **Brand placement:** At the end, separated by ` | ` or ` - `
- **Uniqueness:** Every page must have a unique title
- **Avoid:** Keyword stuffing, ALL CAPS, excessive punctuation
- **Template pattern:** Use `title.template` in Next.js root layout

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Same title on all pages | Search engines cannot differentiate pages | Use `generateMetadata` for dynamic titles |
| Title too long | Truncated in search results | Keep under 60 chars |
| No keyword | Misses search intent | Include primary keyword |
| Keyword stuffing | Looks spammy, may be penalized | One keyword, naturally placed |
| Missing brand | Lower brand recognition | Add brand at end with separator |

## Meta Descriptions

### Formulas

| Pattern | Example |
|---------|---------|
| Problem + Solution + CTA | `Struggling with slow page loads? Learn 10 proven techniques to improve Core Web Vitals. Read the guide.` |
| Feature + Benefit + CTA | `Browse 500+ premium widgets with free shipping. Find the perfect widget for your project. Shop now.` |
| Question + Answer + CTA | `What is structured data? A standardized format that helps search engines understand your content. Learn how to implement it.` |
| Stat + Value + CTA | `Join 10,000+ developers who improved their SEO scores by 40%. Get the free Next.js SEO checklist.` |

### Rules

- **Length:** 150-160 characters (Google truncates longer descriptions)
- **Include primary keyword:** Matched keywords are bolded in search results
- **Include a call-to-action:** "Learn more", "Get started", "Shop now", "Read the guide"
- **Match search intent:** Informational queries get educational descriptions, commercial queries get product descriptions
- **Uniqueness:** Every page needs a unique description
- **No HTML:** Plain text only

## Heading Hierarchy

### SEO-Optimized Structure

```
<h1>Primary Keyword: Main Topic                    ← ONE per page, matches page title intent
  <h2>Major Section (secondary keyword)            ← Major content sections
    <h3>Subsection (long-tail keyword)             ← Supporting points
      <h4>Detail                                    ← Rarely needed, specific details
  <h2>Another Major Section
    <h3>Subsection
  <h2>FAQ Section                                   ← Great for FAQ schema
    <h3>Question 1?
    <h3>Question 2?
```

### Rules

- **One H1 per page** that clearly states the page topic
- **Never skip levels** (h1 to h3 without h2 is wrong)
- **Use keywords naturally** in headings (do not force keywords)
- **H2s for major sections** -- these become the outline of the page
- **H3s for subsections** -- these support the H2 topic
- **FAQ-style H3s** are eligible for FAQ rich results when paired with JSON-LD

## Keyword Placement

### Priority Locations (in order)

1. **Title tag** -- most important
2. **H1 heading** -- should match or closely reflect title intent
3. **URL slug** -- `/products/blue-widget` not `/products/item-123`
4. **First paragraph** -- include keyword within the first 100 words
5. **H2 headings** -- use related/secondary keywords
6. **Image alt text** -- describe the image with relevant keywords
7. **Meta description** -- for user click-through, not direct ranking factor

### Rules

- Write for humans first, search engines second
- Use the primary keyword 2-3 times naturally per 1000 words
- Use synonyms and related terms (LSI keywords) throughout
- Never keyword-stuff (repeating the same phrase unnaturally)

## Internal Linking

### Architecture Principles

**Hub and Spoke Model:**
- Hub pages (category pages) link to all spoke pages (individual items)
- Spoke pages link back to their hub
- Hubs link to other relevant hubs

```
Homepage
  ├── Products (hub) ────────┐
  │     ├── Widget A (spoke) │
  │     ├── Widget B (spoke) │
  │     └── Widget C (spoke) │
  ├── Blog (hub) ────────────┤ (cross-link relevant spokes)
  │     ├── SEO Guide ◄──────┘
  │     ├── Performance Tips
  │     └── Design Trends
  └── About
```

### Anchor Text Rules

| Type | Example | Use |
|------|---------|-----|
| Exact match | `<a href="/seo-guide">SEO guide</a>` | Use sparingly (1-2 per page) |
| Partial match | `<a href="/seo-guide">comprehensive SEO guide for beginners</a>` | Preferred |
| Branded | `<a href="/seo-guide">Acme's SEO guide</a>` | Good for brand building |
| Natural | `<a href="/seo-guide">learn more about optimizing for search</a>` | Best for readability |
| Generic | `<a href="/seo-guide">click here</a>` | Avoid -- provides no context |

### Implementation

```tsx
// Breadcrumb navigation (great for internal linking + structured data)
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Blue Widget</li>
  </ol>
</nav>

// Related content links
<section>
  <h2>Related Products</h2>
  <ul>
    <li><a href="/products/red-widget">Red Widget</a></li>
    <li><a href="/products/green-widget">Green Widget</a></li>
  </ul>
</section>
```

### Rules

- Every page should be reachable within 3 clicks from the homepage
- Use descriptive anchor text (not "click here")
- Link from high-authority pages to important pages
- Update old content to link to new relevant content
- Navigation links count as internal links

## Content Freshness

Search engines favor recently updated content for time-sensitive queries.

### Signals

- `dateModified` in structured data (update when content changes)
- `lastModified` in sitemap (actual modification date)
- Visible "Updated on" date in content
- Actual content changes (not just changing the date)

### Update Strategy

- Review top-performing content quarterly
- Update statistics, examples, and links
- Add new sections for emerging topics
- Remove outdated information
- Update the `dateModified` in JSON-LD and the visible date

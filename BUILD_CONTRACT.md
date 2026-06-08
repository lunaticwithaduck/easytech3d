# Build contract — 1:1 storefront port

You are porting **easytech3d.com** (a Shopify store) to this Next.js app, 1:1. Read this fully
before writing code. Follow it exactly so all parts compose.

## Sources of truth
- **Structure / composition / copy (BG):** the Liquid theme at
  `c:/Users/lyubomir.pacheliev_o/Downloads/theme/` — `templates/*.json` (page section order),
  `sections/*.liquid`, `snippets/*.liquid`, `locales/bg.json`.
- **Visual truth (current live look):** captured reference at
  `c:/Users/lyubomir.pacheliev_o/Documents/projects/easytech3d/tools/output/reference/` —
  `pages/<slug>/desktop.png` + `mobile.png` (READ these images), `design-data.json` (per-page
  computed colors/fonts/spacing/section tree), `pages/<slug>/page.html` (rendered markup).
- When the August-2025 Liquid backup disagrees with the live capture, **the live capture wins**
  (e.g. font is Instrument Sans, not Neue Haas Unica).

## Data (the mock backend — already built)
Import from `@/server/catalog/data` and types from `@/server/catalog/types`. Functions:
`getMenu()`, `getFooterMenu()`, `getCollections()`, `getCollection(handle)`,
`getProductsInCollection(handle, sort?)`, `getProduct(handle)`, `getAllProducts()`,
`getRelatedProducts(handle, limit?)`, `searchProducts(query)`, `getArticles()`,
`getArticle(blog, handle)`, and `homeConfig` (slides, featuredGroups, categoryShowcase,
features, blog, newsletter). Types: `Product`, `ProductCardData`, `Collection`, `Article`,
`NavItem`, `Money`, `ImageRef`, `SortKey`. **Do not invent new data shapes** — extend types.ts
only if strictly needed.

## Design-system primitives (use these — NEVER raw HTML)
Import from `@/design-system/primitives/<Name>/<Name>`:
- `<Text as="h1|h2|h3|h4|h5|h6|p|span|label" size weight color value="…" params={{}} />` —
  copy goes through `value=` (string). Runtime data (product titles from the API) goes as
  `children`: `<Text as="h3">{product.title}</Text>`. `size`: `2xs xs sm base lg xl 2xl 3xl 4xl 5xl 6xl`.
  `weight`: `normal medium semibold bold`. `color`: any token name or `current`.
- `<TextPrice amount={n} currency="BGN" size weight color />` — **import directly** in Server
  Components: `import { TextPrice } from '@/design-system/primitives/Text/TextPrice'` (do NOT use
  `Text.Price` from a server component — it's undefined across the RSC boundary).
- `<Button variant="primary|secondary|outline|ghost|destructive" size="sm|md|lg|xl" loading asChild unstyled>` —
  string children auto-wrap in `<Text>`; for a link-button use `<Button asChild><Link …>…</Link></Button>`.
- `<Link href={routes.x} variant="default|muted|primary|nav|unstyled" size external>` — wraps the
  locale-aware link. `href` MUST come from `@/config/routes` (R7), never a string literal.
- `<Image src alt fill sizes className />` or with `width`/`height` — wraps `next/image`.
- An `<Input>` and `<Icon>` primitive may not exist yet; if you need one, CREATE it under
  `@/design-system/primitives/` (design-system is exempt from the convention linter, so it may use
  raw HTML / lucide-react). Prefer `lucide-react` icons (already a dependency).

## Tokens (Tailwind v4 — class names)
Colors → `bg-*`, `text-*`, `border-*`, `ring-*`: `background elevated paper backdrop text muted
inverse primary secondary accent destructive success warning sale border ring`. Brand accent =
`primary` (#ff1b5c). Body text = `text` (#232323). Radius → `rounded-sm|md|lg|xl|button|full`.
Font sizes → `text-2xs … text-6xl`. Spacing → Tailwind defaults. **No hex, no arbitrary `[..]`
values in app code** (R4) — put unavoidable ones in a co-located `*.styles.ts` (CVA).

## Conventions (enforced by `pnpm lint:conventions`, scans src/app + src/features)
- R1 no inline `style={}` → CVA `*.styles.ts`. R3 no raw `<p>/<h1-6>/<a>/<img>/<button>/<input>/
  <label>/<textarea>` → primitives. Copy via `<Text value=…>`. R4 tokens only. R5 one component
  per file (extract to `./components/<Name>/<Name>.tsx`). R7 hrefs via `@/config/routes`. R8
  fonts only from `@/app/fonts`, next/link only via the Link primitive.
- Feature-folder anatomy: `Feature.tsx` + `Feature.styles.ts` (CVA) + `components/<Child>/…` +
  `config/constants.ts` + `utils/*.utils.ts`. No index barrels — import full paths.
- Copy: use the **BG strings** from the Liquid/reference directly as `value="БГ текст"` — the
  translate fallback renders literals when no message key exists. (EN can come later.)

## Shared composed components — build these in Phase 1 (exact APIs)
Location `src/features/_shared/<Name>/<Name>.tsx`:
- `Container({ children, className?, size?: 'default'|'wide'|'narrow' })` — centered max-width wrapper.
- `Section({ children, className?, background?: 'default'|'muted'|'white' })` — vertical band.
- `SectionHeading({ title: string, subtitle?: string, align?: 'center'|'left', className? })` —
  small eyebrow `subtitle` above a bold `title` (matches the reference's section headers).
- `PriceTag({ price: Money, compareAtPrice?: Money|null, size?, className? })` — price + struck compareAt + sale styling.
- `ProductCard({ product: ProductCardData, className? })` — image, title, PriceTag, sale badge; whole card links to `routes.product(handle)`.
- `ProductCarousel({ products: ProductCardData[], title?: string, className? })` — horizontal scroll-snap row of ProductCards (no carousel lib; CSS scroll-snap + Button arrows; `'use client'`).
- `Breadcrumbs({ items: { label: string, href?: string }[] })`.
Location `src/features/chrome/<Name>/<Name>.tsx`:
- `AnnouncementBar({ message: string })`.
- `Header({ menu: NavItem[] })` — logo (text wordmark "EasyTech3D" is fine), desktop nav with
  hover mega-menu for items with `children`, search affordance, cart icon link (`routes.cart`),
  account icon, locale switch (BG/EN). Mobile: hamburger → drawer. Use client subcomponents.
- `Footer({ menu: NavItem[] })` — multi-column link lists + newsletter + copyright.

## Pages — build in Phase 2 (route → data → reference)
Each under `src/app/[locale]/…/page.tsx` (Server Component; `await params`, `setRequestLocale`),
composing feature components in `src/features/<name>/`:
- **home** `/` → `homeConfig` + collections/products/articles; sections in order: slideshow hero,
  3× featured-product carousels, category circles ("Всички Категории"), icons-with-text
  ("Защо да купувате от нас?"), featured-blog, newsletter. Ref: `pages/root/desktop.png`, `templates/index.json`.
- **collection** `/collections/[handle]` → `getCollection`+`getProductsInCollection`; banner, breadcrumbs, sort, product grid (3-up desktop / 1 mobile). Ref: a `collections-*` slug, `sections/collection-template.liquid`.
- **collections index** `/collections` → `getCollections`; grid of collection cards. Ref: `templates/list-collections.json`.
- **product** `/products/[handle]` → `getProduct`+`getRelatedProducts`; media gallery, title, PriceTag, variant selector (options), add-to-cart Button (no-op stub), description, related carousel. Ref: a `products-*` slug, `sections/product-template.liquid`.
- **cart** `/cart` → empty-cart state + a stub line-item table + summary (no live cart this session). Ref: `sections/cart-template.liquid`.
- **search** `/search` → `searchProducts(searchParams.q)`; query input + results grid. Ref: `sections/search-page.liquid`.
- **blog index** `/blogs/[blog]` → `getArticles`; article cards grid. Ref: `sections/blog-template.liquid`.
- **article** `/blogs/[blog]/[slug]` → `getArticle`; hero image, title, content. Ref: `sections/article-template.liquid`.
- **static page** `/pages/[slug]` → render a titled content block; `/pages/contact` shows a contact form (use the Input primitive). Ref: `sections/main-page.liquid`, `page-contact.liquid`.
- **404** `app/[locale]/not-found.tsx` → friendly message + back-home Button. Ref: `sections/main-404.liquid`.

Keep it faithful but pragmatic: match layout, section order, spacing rhythm, tokens, and BG copy
from the reference. Stubs (add-to-cart, newsletter submit, search-as-you-type) are fine — wire to
no-op handlers; the backend comes next.

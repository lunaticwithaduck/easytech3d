# Liquid → Next.js Translation Guide

**Mission: translate, do not rebuild.** The structure and CSS of easytech3d.com already exist.
Your job is to convert the Shopify **Liquid** templates into React/TSX, preserving the markup and
class names *exactly*, so the theme's own CSS (already loaded globally) styles them. Do **not**
re-derive layouts as utilities, do not invent class names, do not approximate. Read the real source
and mirror it.

## Sources (read these — don't guess)

- **Liquid theme** (the thing you translate): `tools/output/liquid-template/`
  - `layout/theme.liquid` · `sections/*.liquid` · `snippets/*.liquid` · `templates/*.json`
  - `assets/*.css` (already copied to `src/styles/theme/` and imported — do NOT re-style)
  - `locales/bg.json` (BG copy for `{{ '...' | t }}` keys) · `config/settings_data.json` (settings)
- **Rendered ground truth**: `tools/output/reference/mirror/<route>/index.html` — the live HTML with
  every Liquid filter resolved. Use it to confirm exact class lists, attribute order, and the real
  menu/breadcrumb/markup when a `.liquid` is ambiguous.
- The real CSS is in `src/styles/theme/` — read it to understand a class, never to edit it.

## Output file layout

```
src/components/
  layout/        AnnouncementBar.tsx, Header/Header.tsx (+ parts), Footer/Footer.tsx, CartDrawer.tsx
  sections/      Slideshow.tsx, FeaturedProducts.tsx, CollectionList.tsx, IconsWithText.tsx,
                 FeaturedBlog.tsx, Newsletter.tsx
  product/       ProductCardItem.tsx, ProductPriceListing.tsx, ProductMedia.tsx, ProductForm.tsx,
                 ProductSwatches.tsx
  snippets/      Icon.tsx, Rte.tsx (done), Breadcrumbs.tsx, Pagination.tsx
  templates/     CollectionTemplate.tsx, ProductTemplate.tsx, ListCollectionsTemplate.tsx,
                 BlogTemplate.tsx, ArticleTemplate.tsx, SearchTemplate.tsx, CartTemplate.tsx,
                 Page404.tsx, PageTemplate.tsx, ContactTemplate.tsx
  util/          BodyClass.tsx (done)
app/[locale]/**/page.tsx   route wiring: fetch data + render a template
```
One component per file. Default export not required; use named exports.

## Data layer — import, never re-fetch shape

- `@/data/catalog` → `getCollections, getCollection, getProductsInCollection, getProduct,
  getAllProducts, getRelatedProducts, searchProducts, getArticles, getArticle, getBlog`
- `@/data/home` → home section configs (already transcribed from index.json)
- `@/data/settings` → `shop, announcementBar, header, footer, social, flags`
- `@/data/menus` → `mainMenu, footerMenu` (MenuLink[])
- `@/lib/shopify/types` → `ShopProduct, ShopCollection, ShopArticle, ShopBlog, ShopVariant,
  ShopOption, ShopImage, MenuLink, SortKey`
- `@/lib/shopify/money` → `dualPrice, money, moneyWithoutCurrency, percentSavings, EUR_RATE`
- `@/lib/shopify/image` → `imageUrl(src, w), imageSrcset(src, naturalWidth)`
- `@/lib/cn` → `cn(...classes)`

**Money is integer cents** (Shopify-style). `product.price === 2490` → render with `dualPrice(2490)`
= `"24.90 лв / 12.70 €"`. Compare-at in a `<s>` via `money(compareAtCents)`.

## Translation rules (Liquid → JSX)

| Liquid | JSX |
|---|---|
| `class="a b c"` | `className="a b c"` — **verbatim**, including `h4`, `page-width`, `btn btn--primary`, etc. |
| `{% if x %}…{% endif %}` | `{x && (…)}` |
| `{% if x %}A{% else %}B{% endif %}` | `{x ? (A) : (B)}` |
| `{% unless x %}` | `{!x && (…)}` |
| `{% for p in list limit:N %}` | `{list.slice(0, N).map((p) => (…))}` (add `key`) |
| `{% case %}/{% when %}` | `switch`/ternary chain |
| `{{ obj.field }}` | `{obj.field}` |
| `{% include 'x', a: b %}` / `{% render 'x', a: b %}` | `<X a={b} />` |
| `{{ 'some.key' \| t }}` | the **literal BG string** from `locales/bg.json` (inline it; BG-primary) |
| `{{ price \| money_without_currency }} лв / …` | `{dualPrice(cents)}` |
| `{{ img \| img_url: '535x' }}` | `imageUrl(src, 535)` |
| `style="padding-top:{{x}}%"` | `style={{ paddingTop: \`${x}%\` }}` (only for genuinely dynamic Liquid styles) |
| `href="{{ product.url }}"` (internal `/…`) | `import { Link } from '@/i18n/navigation'` → `<Link href={product.url}>` |
| `href="#"` / `javascript:void(0)` / external | plain `<a>` |

- **No Tailwind utilities.** Only the theme's class names. **No inline styles** except dynamic ones
  the Liquid itself computes (aspect-ratio padding, overlay opacity, swatch background-image).
- **`'use client'`** only where there is real interactivity: carousels/sliders (Slideshow,
  FeaturedProducts tabs, CollectionList, product gallery), accordions, mobile menu, search input,
  quantity steppers, swatch selection. Everything else stays a Server Component.
  - The live theme uses Flickity + theme.js. You don't need Flickity: reproduce the **markup +
    classes** statically, and add minimal React state for tab switching / a CSS scroll-snap track
    for carousels. Faithful markup + correct CSS is the goal; behaviour is a light enhancement.
- Internal navigation uses the locale-aware `Link` from `@/i18n/navigation` (keeps `/bg` prefix).

## Shared component contracts (EXACT — other agents import these)

```ts
// src/components/snippets/Icon.tsx  — translate snippets/icon.liquid (+ icon-*.liquid)
export function Icon({ name, className }: { name: string; className?: string }): JSX.Element
//   names used across the theme: 'tail-right','tail-left','cart','search','hamburger','close',
//   'chevron-down','chevron-left','plus','minus','user','heart', social: 'facebook','twitter',
//   'pinterest','instagram','youtube'. Render the theme's inline <svg> (exact viewBox/paths from
//   icon.liquid / the matching icon-*.liquid). Unknown name → render nothing.

// src/components/snippets/Rte.tsx  (DONE) — { html: string; className?: string }

// src/components/product/ProductPriceListing.tsx — translate snippets/product-price-listing.liquid
export function ProductPriceListing(props: { product: ShopProduct; variant?: ShopVariant }): JSX.Element
//   dual лв/€ via dualPrice; .price wrapper with price--on-sale / price--sold-out modifiers.

// src/components/product/ProductCardItem.tsx — translate snippets/product-card-item.liquid
export function ProductCardItem(props: {
  product: ShopProduct; maxHeight?: number; showVendor?: boolean; list?: boolean;
}): JSX.Element
//   .product-item-block > .product-card. Labels (.product-item__label-list: sale GREEN via
//   --product_label_sale_color, sold-out grey), .product-item--media (image 200px + swatches),
//   .product-item--info (vendor, .product-card__title h4, price row, action form). The add-to-cart
//   has no backend: render the theme's `.btn.btn--primary` button markup with the cart icon, type
//   "button" (no form submit). Use percentSavings for the discount label.

// src/components/snippets/Breadcrumbs.tsx
export function Breadcrumbs(props: { items: { title: string; url?: string }[] }): JSX.Element
```

## Done already (don't recreate)

- Foundation CSS: `src/styles/theme/*` + `src/app/globals.css` + computed `:root`
  (`variables-root.css`). Fonts wired in `src/app/fonts.ts`.
- Data layer: `src/data/*`, `src/lib/shopify/*`, `src/lib/cn.ts`.
- Chrome layout: `src/app/[locale]/layout.tsx` (renders AnnouncementBar, Header, Footer, CartDrawer).
- Home page: `src/app/[locale]/page.tsx` (renders the 6 section components with resolved data).
- Helpers: `Rte`, `BodyClass`.

## Section component prop contracts (from app/[locale]/page.tsx)

```ts
Slideshow({ slides: HomeSlide[]; settings: typeof slideshowSettings })
FeaturedProducts({ title: string; subtitle: string; navigationStyle: 'large'|'normal'; grid: number;
                   tabs: { heading: string; products: ShopProduct[] }[] })
CollectionList({ section: typeof collectionListSection; collections: ShopCollection[] })
IconsWithText({ section: typeof iconsWithTextSection })
FeaturedBlog({ section: typeof featuredBlogSection; articles: ShopArticle[] })
Newsletter({ section: typeof newsletterSection })
```
(`HomeSlide` etc. are exported from `@/data/home`.)

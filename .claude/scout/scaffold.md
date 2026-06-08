# SCOUT: scaffold — exhaustive inventory of `easytech3d/src` (+ the ground-truth assets)

> Reconnaissance for a faithful 1:1 port of **easytech3d.com** (BG Shopify "Dawn"-family theme)
> into Next.js 16 + Tailwind 4. The previous attempt **approximated** with generic Tailwind and
> looked childish because it ignored the real captured assets. This file is the source of truth a
> build agent reads. Every component below is tagged **KEEP** / **REBUILD-FAITHFULLY** / **DELETE**.
>
> Rule of thumb: **the shell + i18n + data + token PIPELINE stay; every visual component gets
> rebuilt with exact values pulled from the ground-truth sources listed in §0.**

---

## 0. GROUND-TRUTH SOURCES (the build agent MUST read these — they are the whole point)

The previous attempt failed because it never opened these. They are NOT in `src/` — they live under
`tools/output/` (gitignored, but present on disk). **These are authoritative; the approximated
`src/features/*` is not.**

| Source | Path | What it gives you | Use for |
|---|---|---|---|
| **Liquid theme (structure/copy/section order)** | `tools/output/liquid-template/` | full Shopify theme: `templates/*.json`, `sections/*.liquid`, `snippets/*.liquid`, `locales/bg.json` | exact section order, exact BG copy, grid counts, overlay opacities, settings |
| **Theme CSS variables (EXACT design tokens)** | `src/theme/css/settings.css` (162 lines, already in repo, **NOT imported anywhere**) | real `--font-h1-desktop:80`, `--font-h2-desktop:52`, `--font-h3-desktop:40`, button colors `#ff1b5c`/`#e70042`, heading letter-spacing 2px/1px, `--product-image-height:200px`, etc. | the REAL type ramp + colors — far more accurate than `tokens.ts`/`typography.ts` |
| **Full compiled theme CSS** | `tools/output/liquid-template/assets/theme.css` (11,622 lines) | every real class + value the live site renders | look up any exact px/rule by class name |
| **Per-route design brief** | `tools/output/reference/design-notes.md` (8,238 lines) | per-page: typography table (family/size/weight/lh + counts), top-15 colors, padding/margin/radius histograms, section tree with crop refs | per-page spacing rhythm & type sizes |
| **Structured digest** | `tools/output/reference/design-data.json` (1.02 MB) | machine-readable computed colors/fonts/spacing/section tree per route | programmatic lookups |
| **Rendered HTML per route** | `tools/output/reference/mirror/<route>/index.html` + `tools/output/reference/pages/<slug>/page.html` | real markup/class names | copy structure 1:1 |
| **Screenshots (offline-durable visual truth)** | `tools/output/reference/pages/<slug>/desktop.png` · `mobile.png` · `mobile-menu-open.png` + `sections/NN-*.png` | the look to match | READ these images before building any section |
| **Derived design tokens** | `tools/output/design-tokens/tokens.json` · `tokens.css` · `tailwind.tokens.cjs` | heuristic token starting point (already partly folded into `tokens.ts`) | cross-check |
| **Brand palette** | `tools/output/palette/palette.json` · `palette.html` | 8 swatches with usage weights | color roles |
| **Coverage proof / findings** | `tools/FINDINGS.md` · `tools/output/reference/gap-check.json` | 68 routes captured, 100% of non-product pages | scope |

**Key correction the build agent must internalize:** when the Aug-2025 Liquid backup disagrees with
the live capture, **the live capture wins** (per `BUILD_CONTRACT.md`). Example: font is **Instrument
Sans**, not the theme's declared `Archivo Narrow` for navigation. But `settings.css` desktop/mobile
type sizes (h1 80/56, h2 52/40, h3 40/26, h4 22/19) ARE the live values — use them.

### 0.1 Worked example of the approximation gap (home hero)
`templates/index.json` (the REAL home) specifies, in order, 11 sections:
`slideshow → featured-products ×3 → collection-list (category circles) → index-icons-with-text →
slideshow(disabled) → logo-bar(disabled) → featured-blog → newsletter → apps(breadcrumb)`.
The slideshow block settings are exact: 3 active slides, `slideshow_height:"small"`,
`slideshow_mobile_height:"medium"`, `text_size:"large"`, overlay `#000` at **55% / 40% / 60%**
opacity (per-slide), `autorotate:true` `speed:6`, `show_dots:true`, `show_arrows:true`,
`text_alignment:"left center"/"left bottom"`, CTA labels "Яко, заведи ме!" / "Купете сега" /
"Всички колекции", custom CSS hides slideshow on mobile `@media(max-width:750px)`.
The approximated `HeroSlideshow.tsx` instead guessed `h-[32rem]/lg:h-[36rem]`, a flat
`bg-backdrop` (50%) overlay for all slides, a `max-w-[1200px]` content column, and pink circular
arrow buttons — none derived from the above. **That is the pattern to fix across every section.**

---

## 1. SHELL — **KEEP ALL** (do not touch; wire visual components into it)

| File | Verdict | Notes |
|---|---|---|
| `src/app/layout.tsx` | **KEEP** | Pass-through root layout (next-intl pattern); imports `globals.css`. |
| `src/app/[locale]/layout.tsx` | **KEEP** (one edit) | Renders `<html>/<body>`, `setRequestLocale`, `NextIntlClientProvider`, composes `AnnouncementBar` + `Header` + children + `Footer`. **Edit:** AnnouncementBar message is hardcoded BG copy inline ("Безплатна доставка при поръчки над 100 лв. · Изпращаме в същия ден") — fine, but the real theme's announcement copy should be confirmed against `sections/announcement-bar.liquid` / `locales/bg.json`. |
| `src/middleware.ts` | **KEEP** | `createMiddleware(routing)`, matcher skips api/_next/_vercel/files. Standard. |
| `src/i18n/routing.ts` | **KEEP** | locales `['bg','en']`, default `bg`, `localePrefix:'always'`. |
| `src/i18n/navigation.ts` | **KEEP** | next-intl navigation (Link/redirect/usePathname/useRouter) bound to routing. |
| `src/i18n/request.ts` | **KEEP** | `getRequestConfig` loads bundled `messages/<locale>.json`. |
| `src/i18n/translate.ts` | **KEEP** | `useTranslate()` — the `<Text value=>` resolver; renders literal default when no key exists (so BG copy passed as `value="…"` just renders). This is WHY copy can be inlined. |
| `src/i18n/messages/bg.json`, `en.json` | **KEEP** (stubs) | Only a `Home` namespace exists (eyebrow/title/subtitle/ctas). Everything else renders via literal fallback. Expand later; not blocking. |
| `src/config/routes.ts` | **KEEP** | Typed route table (R7 source of hrefs). home/collections/collection(h)/product(h)/cart/search/blog/article/page/contact/printOnOrder/policy/account. |
| `src/app/fonts.ts` | **KEEP** | `Instrument_Sans` (400/500/600/700, latin subset, `--font-instrument-sans`). Cyrillic falls back (same as live). Note for later: a Cyrillic cut would be more faithful (live site renders Cyrillic in Instrument Sans via Shopify's font service). |
| `next.config.ts` | **KEEP** | `output:'standalone'`, images allow `cdn.shopify.com` (+ optional `NEXT_PUBLIC_MEDIA_HOST`). Mock data loads imagery from that CDN. |
| `src/middleware.ts`, `package.json` scripts | **KEEP** | scripts: `dev/build/typecheck/lint(biome)/lint:conventions/theme:generate/theme:watch/test(vitest)/e2e(playwright)`. |

---

## 2. DESIGN-SYSTEM — token PIPELINE **KEEP**; token VALUES need reconciliation; primitives **KEEP**

The design-system is **exempt from the convention linter** (lives in `src/design-system/**`, which
the linter does not scan) — primitives may use raw HTML / lucide-react / next/link / next/font.

### 2.1 Token pipeline (KEEP the mechanism)
| File | Verdict | Notes |
|---|---|---|
| `src/design-system/tokens.ts` | **KEEP pipeline / RECONCILE values** | Flat string maps (regex-parsed by generator). Colors match the capture well: `text #232323`, `background #ffffff`, `elevated #f4f4f4`, `paper #ebebeb`, `primary #ff1b5c`, `accent #fd5b2a`, `destructive #ea0606`, `sale #00a500`, `border #e4e4e4`. radius `sm 3px / md 10px / lg 20px / xl 50px / button 10px / full 9999px` — matches theme radius histogram (20/50/50%/10/3). zIndex + breakpoints present. |
| `src/design-system/typography.ts` | **KEEP pipeline / RECONCILE values** | `fontSize` ramp 2xs..6xl (13→36px). **GAP:** the ramp tops out at 36px, but the live hero/headings go far higher — `settings.css` says **h1 80px, h2 52px, h3 40px** desktop (mobile 56/40/26) and the home page renders 100px/46.8px hero text (`design-notes.md`). The build agent will need larger sizes (add to the ramp or use `.styles.ts` arbitrary values — see R4 note §5). fontWeight 400/500/600/700, lineHeight + letterSpacing scales present. **Heading letter-spacing in the live theme is 2px(h1/h2)/1px(h3/h4)/0.5px(h5/h6)** — not in the current scale. |
| `src/design-system/tailwindBridge.ts` | **KEEP** | Maps tokens → class names (`textSize`/`textWeight`/`textColor`/`bgColor`/`borderColor`). CVA files reference these. |
| `src/design-system/scripts/generate-theme.cjs` | **KEEP** | Parses `tokens.ts`+`typography.ts` → emits `theme.css` `@theme` block (colors+radius+text sizes). Run `pnpm theme:generate`. |
| `src/design-system/theme.css` | **KEEP (generated)** | Auto-generated; do not hand-edit. Regenerate after any token change. |
| `src/app/globals.css` | **KEEP** | `@import "tailwindcss"` + `theme.css`; sets `--font-sans` to Instrument Sans stack; html/body bg/color/font. **Consider importing `src/theme/css/settings.css`** if the build wants the real Shopify variables available as CSS vars (currently it is orphaned — see §6). |
| `src/design-system/lib/cn.ts` | **KEEP** | `clsx` + `tailwind-merge`. |

### 2.2 Primitives (KEEP — these are correct and used everywhere)
| Primitive | Verdict | API surface (for the build agent) |
|---|---|---|
| `Text/Text.tsx` (+ `Text.styles.ts`) | **KEEP** | `<Text as size weight color value params asChild>`. Static copy via `value=`; runtime data via children. `Object.assign(TextBase,{Price})` — but **in Server Components import `TextPrice` directly** (Text.Price is undefined across RSC). `parseInlineMarkdown` handles `**bold**`/`*italic*`/`__underline__`. |
| `Text/TextPrice.tsx` | **KEEP** | `<TextPrice amount currency size weight color>`. |
| `Text/parseInlineMarkdown.tsx` | **KEEP** | inline md → spans. |
| `Button/Button.tsx` (+ styles) | **KEEP / RECONCILE styling** | variants `primary|secondary|outline|ghost|destructive`, sizes `sm|md|lg|xl`. **Approximation note:** `primary` = `bg-primary text-inverse hover:bg-primary/90` `rounded-button`(10px). Live theme primary button hover is the exact darker `#e70042` (`--color-btn-primary-darker`), and live buttons are often **pill/50px radius** in places — verify against `theme.css`/screenshots per usage. |
| `Link/Link.tsx` (+ styles) | **KEEP** | locale-aware wrapper over next-intl Link; variants `default|muted|primary|nav|unstyled`. |
| `Image/Image.tsx` | **KEEP** | thin `next/image` wrapper, alt defaults "". |
| `Icon/Icon.tsx` | **KEEP** | lucide-react wrapper. **Faithfulness note:** the live theme ships its OWN SVG icon set (`snippets/icon-*.liquid`: hamburger, search, cart, chevrons, social, in-stock/out-of-stock, 3d-badge, etc.). For a true 1:1, port those SVGs rather than substituting lucide glyphs. lucide is acceptable as a pragmatic stand-in but is a visible divergence. |
| `Input/Input.tsx` (+ styles) | **KEEP** | exists; used by contact/search/newsletter. |
| `Textarea/Textarea.tsx` (+ styles) | **KEEP** | exists; used by contact form. |

---

## 3. DATA LAYER — **KEEP ALL** (do not invent new shapes; extend `types.ts` only if needed)

| File | Verdict | Notes |
|---|---|---|
| `src/server/catalog/types.ts` | **KEEP** | Domain contract: `Money{amount,currencyCode:'BGN'|'EUR'}`, `ImageRef`, `ProductVariant`, `ProductOption`, `Product`, `ProductCardData`, `Collection`, `Article`, `NavItem`, `SortKey`. |
| `src/server/catalog/data.ts` | **KEEP** | MOCK backend, faithful to theme: 21 real collection handles+BG titles; products generated per collection (BG color/weight variants, BGN prices); 10 real article titles; real `menu`/`footerMenu`; **`homeConfig`** (slides, featuredGroups, categoryShowcase, features, blog, newsletter) mirrors `templates/index.json`. Imagery from Shopify CDN `cdn.shopify.com/s/files/1/0726/9413/7129`. Accessors: `getMenu/getFooterMenu/getCollections/getCollection/getProductsInCollection/getProduct/getAllProducts/getRelatedProducts/searchProducts/getArticles/getArticle`. |
| `src/lib/api/client.ts` | **KEEP** | `apiFetch<T>` seam to the real backend (separate repo); `ApiError`; zod-validated. Not wired this session — mock data is used. |

**Note:** `homeConfig` in `data.ts` already encodes the right composition. The category showcase
in the real theme is **5-up circles** (`grid:5`, `image_style:"circle"`, overlay `#000` @ 82%) —
the data lists 7 collection handles; render them in the circle style from the reference, not as
generic cards.

---

## 4. FEATURE COMPONENTS — **REBUILD-FAITHFULLY** (structure is right, visual VALUES are guessed)

All of these compose primitives correctly and pass the linter, but their `*.styles.ts` values
(heights, paddings, overlays, radii, type sizes, hover colors, layout) are **invented**, not pulled
from §0. **Verdict for every component below: REBUILD-FAITHFULLY** — keep the file/prop scaffolding,
replace the visual values against the matching `sections/*.liquid` + `pages/<slug>/desktop.png` +
`design-notes.md`. Do NOT delete; re-skin in place so the wiring (data props, routes, primitives)
survives.

### 4.1 Chrome (`src/features/chrome/`)
- `AnnouncementBar/` — ref: `sections/announcement-bar.liquid`. Currently a thin bar; verify bg/copy.
- `Header/` (+ `DesktopNav`, `MegaMenu`, `MobileMenu`, `MobileNavAccordion`, `SearchBar`, `LocaleSwitch`) — ref: `sections/header.liquid`, `snippets/desktop-menu.liquid`, `mega-menu.liquid`, `site-nav.liquid`, `categories-menu.liquid`; `pages/root/sections/01-header-*.png`. **Approximation flags:** wordmark is a text "EasyTech3D" (live uses a logo image `logo_100x.jpg`); cart/account rendered as **pink circular icon buttons** (`iconActionClass` bg-primary) — verify the live treatment (the live theme DOES use pink `--color-btn-primary` for the cart/search buttons per `settings.css` lines 157-161, so this is plausibly correct — confirm against screenshot). Header height guessed `h-16 lg:h-20`; live header section is 240px tall incl. nav rows.
- `Footer/` (+ `FooterColumn`, `FooterBottomBar`, `FooterNewsletter`) — ref: `sections/footer.liquid`; footer screenshot.

### 4.2 Shared composed (`src/features/_shared/`)
- `Container/`, `Section/`, `SectionHeading/` — layout primitives; `SectionHeading` = small eyebrow over bold title (matches reference section headers — eyebrow/subtitle pattern is real, e.g. "Най-Популярни" over "Филаменти за 3D принтер").
- `PriceTag/` — price + struck compareAt + sale styling. Sale color `#00a500` (`--product_label_sale_color`), sale-text `#ea0606`.
- `ProductCard/` — image+title+PriceTag+sale badge; whole card → `routes.product(handle)`. Ref: `snippets/product-card-item.liquid`, `product-price.liquid`. **Live product image height = 200px** (`--product-image-height`).
- `ProductCarousel/` — CSS scroll-snap row + Button arrows (`'use client'`). Live uses Flickity carousels (grid:4 desktop / 1 mobile, dots+arrows, autoplay). Ref: `sections/featured-products.liquid`.
- `Breadcrumbs/` — breadcrumb color `#FF1B5C` (`--breadcrumbs_color`). Ref: `snippets/breadcrumbs.liquid`.

### 4.3 Home (`src/features/home/`) — ref `templates/index.json` (§0.1) + `pages/root/`
- `Home.tsx` — section composition.
- `HeroSlideshow/` — **biggest gap** (see §0.1). ref `sections/slideshow.liquid`.
- `FeaturedProductsRow/` (+ `FeaturedProductsTabs`) — 3 carousels; ref `sections/featured-products.liquid`. grid 4-up/1.
- `CategoryShowcase/` — "Всички Категории", **5-up circles**, CTA "Вижте категориите" → /collections; ref `sections/collection-list.liquid`.
- `FeatureIcons/` — "Защо да купувате от нас?" / "от ентусиасти за ентусиасти", 3 icons (money-check/truck/envelope) + BG copy; ref `sections/index-icons-with-text.liquid`.
- `FeaturedBlogRow/` — "Проверете нашият блог" 4 posts w/ author+date; ref `sections/featured-blog.liquid`.
- `NewsletterSection/` — "Абонирайте се към нашият мейл лист" + subheading; ref `sections/newsletter.liquid`.

### 4.4 Collection / Collections (`src/features/collection/`, `collections/`)
- `CollectionPage` (+ `CollectionBanner`, `CollectionDescription`, `CollectionToolbar`, `ProductGrid`, `SortSelect`) — ref `sections/collection-template.liquid`, `snippets/collection-grid-item.liquid`, `collection-sidebar.liquid`. Grid 3-up desktop / 1 mobile per BUILD_CONTRACT (verify vs theme grid setting).
- `CollectionsIndex` (+ `CollectionCard`) — ref `templates/list-collections.json`, `sections/list-collections-template.liquid`, `snippets/collections-grid-item.liquid`.

### 4.5 Product (`src/features/product/`)
- `ProductPage` (+ `ProductGallery`, `VariantSelector`, `AddToCart`) — ref `sections/product-template.liquid`, `snippets/thumbnails-gallery.liquid`, `media.liquid`, `linked_options.liquid`, `swatch.liquid`, `product-price.liquid`. AddToCart is a no-op stub (fine).

### 4.6 Cart (`src/features/cart/`)
- `CartPage` (+ `CartContents`, `CartLineItem`, `EmptyCart`, `OrderSummary`, `QuantityStepper`) — ref `sections/cart-template.liquid`, `snippets/cart-items.liquid`, `cart-drawer.liquid`. Stub (no live cart this session).

### 4.7 Blog / Article (`src/features/blog/`, `article/`)
- `BlogIndex` (+ `ArticleCard`, `BlogHeader`) — ref `sections/blog-template.liquid`, `snippets/blog-sidebar.liquid`.
- `ArticlePage` — ref `sections/article-template.liquid`, `snippets/article_author_block.liquid`, `comment.liquid`.

### 4.8 Page / Contact / Search / Not-found (`src/features/page/`, `search/`, `not-found/`)
- `PageContent` (+ `ContactPage`, `ContactForm`) — ref `sections/main-page.liquid`, `page-contact.liquid`.
- `SearchPage` (+ `SearchForm`) — ref `sections/search-page.liquid`, `advanced-search.liquid`, `search-sidebar.liquid`.
- `NotFound` (+ `NotFoundSearch`) — ref `sections/main-404.liquid`.

### 4.9 Route pages (`src/app/[locale]/.../page.tsx`) — **KEEP wiring, re-skin features**
11 routes exist and are correctly wired (Server Components, `await params`, `setRequestLocale`):
`page.tsx`(home), `collections/page.tsx`, `collections/[handle]/page.tsx`, `products/[handle]/page.tsx`,
`cart/page.tsx`, `search/page.tsx`, `blogs/[blog]/page.tsx`, `blogs/[blog]/[slug]/page.tsx`,
`pages/[slug]/page.tsx`, `policies/[slug]/page.tsx`, `not-found.tsx`. **KEEP all** — they only
compose feature components + data accessors; the rebuild happens inside `src/features/*`.

---

## 5. CONVENTION LINTER (`scripts/lint-conventions.cjs`) — rules that BLOCK faithful reproduction

Scans `src/app/**` + `src/features/**` only (design-system exempt). Rules:

| Rule | What it enforces | Blocks 1:1? | Action |
|---|---|---|---|
| **R1** no inline `style={}` | move to `.styles.ts` (CVA) | **YES — partially** | The live theme is heavily inline/CSS-var driven (per-slide overlay opacity 55/40/60%, dynamic bg images, adaptive colors via `snippets/adaptive-color.liquid` / `css-variables.liquid`). Faithful slides need per-instance values (overlay opacity, bg-image URL, text alignment). **Rescope:** allow inline `style` for *dynamic, data-driven* values (CSS custom properties like `style={{'--overlay-opacity':...}}` or `backgroundImage`), OR provide a sanctioned escape (a `styleProps` util / data-attribute pattern). Currently the only escape is `.styles.ts`, which can't hold per-record runtime values. |
| **R3** no raw `<p>/<h1-6>/<a>/<img>/<button>/<input>/<label>/<textarea>` → primitives; `<Text>` static copy via `value=` | **Low risk** but friction | **Partially** | The reference markup uses raw tags everywhere; porting means re-expressing as primitives. The `<Text value=>` static-copy detector is heuristic and can false-positive on runtime children that contain quotes/`_DATA.title` chains. Also blocks pasting real HTML (e.g. RTE `descriptionHtml` from products/articles) — that content is injected via `dangerouslySetInnerHTML`, not raw tags, so it's fine, but heading/paragraph chrome must go through `<Text>`. **Rescope:** consider relaxing the `<Text>`-children heuristic, or document the `dangerouslySetInnerHTML` path for RTE content. |
| **R4** no hex / no arbitrary `[..]` Tailwind in app code (allowed only in `.styles.ts`) | **YES — the biggest blocker** | **YES** | The faithful ramp needs values absent from the token scale: **h1 80px, h2 52px, h3 40px** (desktop), **letter-spacing 2px/1px/0.5px**, hero **100px / 46.8px**, product-image-height **200px**, overlay opacities, pill radius 50px in places. R4 forbids `text-[80px]`, `tracking-[2px]`, `h-[200px]` etc. in app code. The escape (put arbitrary values in `.styles.ts`) works for static layout but is verbose. **Rescope options:** (a) **extend the token scale** to include the real sizes (add `7xl..` and the real letter-spacings to `typography.ts`, regenerate) so faithful values become token classes — *preferred, keeps R4 strict*; (b) loosen R4's arbitrary-value regex; (c) keep R4 and funnel all arbitrary values through `.styles.ts`. The regex specifically catches `text-[#/digit`, `rounded-[`, `tracking-[`, `leading-[`, `w-[\d`, `h-[\d` (except `dvh`), `p*-[\d`, `m*-[\d`. |
| **R5** one component per file | low | **No** | Extract children to `./components/<Name>/<Name>.tsx`. Already the established pattern. |
| **R7** hrefs via `@/config/routes` | low | **No** | Add any new paths to `routes.ts`. Note BG slug routes exist (e.g. `/blogs/3д-принтове`, `/pages/3d-принт-при-поръчка`, `/pages/общи-условия`) — encode them. |
| **R8** next/link only via Link primitive; next/font only from `app/fonts.ts` | low | **No** | Already followed. |

**Summary of linter rescope needed for faithful reproduction:**
1. **R4 (critical):** extend `typography.ts` with the real size ramp (up to ~100px) + real
   letter-spacings (2px/1px/0.5px) and regenerate `theme.css`, so faithful headings are token
   classes — OR accept verbose `.styles.ts` arbitrary values. Without this, the type ramp stays
   capped at 36px and headings will look undersized (a root cause of the "childish" look).
2. **R1 (important):** sanction a path for per-instance dynamic values (overlay opacity, bg-image,
   text alignment, adaptive colors) — e.g. allow inline CSS custom properties — so slideshow /
   banner / adaptive-color sections can be reproduced.
3. **R3 (minor):** soften the `<Text>`-children false-positive heuristic; document
   `dangerouslySetInnerHTML` for RTE (`descriptionHtml`/`contentHtml`).

---

## 6. ORPHANS / NOTES

- **`src/theme/css/settings.css` is NOT imported anywhere** (orphaned). It is the single most
  accurate token source in `src/` (real Shopify theme variables: exact heading sizes, button
  colors, sale labels, letter-spacing, product-image-height). **Recommendation:** either import it
  into `globals.css` to expose the real CSS vars, or harvest its values into `tokens.ts`/
  `typography.ts` before the rebuild. Do not delete it.
- **`public/` is empty** — no images committed; all imagery loads from `cdn.shopify.com` (mock
  data) per `next.config.ts`. The real product/article/banner images are mirrored under
  `tools/output/reference/mirror/cdn/shop/{files,articles,collections}/` if local assets are wanted.
- **`tools/output/liquid-template/config/settings_data.json` is 0 bytes** (empty) — the live
  theme settings values live in `settings_schema.json` + the extracted `src/theme/css/settings.css`
  + per-template `*.json`, not here.
- **`SESSION.md`** notes are unwritten (template). **`README.md`/`CLAUDE.md`/`BUILD_CONTRACT.md`**
  are the authoritative briefs (BUILD_CONTRACT.md references the Liquid theme at a `Downloads/theme/`
  path; the same content is mirrored at `tools/output/liquid-template/` — use that, it's in-repo-tree).
- **`e2e/`, `tools/node_modules/` (playwright), `.next/`** — tooling/build, ignore for the rebuild.
- **Icons:** lucide-react is used app-wide as a stand-in; the faithful set is `snippets/icon-*.liquid`.

---

## 7. BOTTOM LINE FOR THE BUILD AGENT

- **Don't touch:** shell (§1), token pipeline + primitives + cn (§2), data layer (§3), route pages (§4.9).
- **Rebuild in place (re-skin `.styles.ts`, keep props/wiring):** every component in §4.1–4.8.
- **Before building any section:** open the matching `sections/*.liquid` (structure/copy),
  `templates/*.json` (order/settings), `pages/<slug>/desktop.png`+`mobile.png` (look), and the
  per-route block in `design-notes.md` (type sizes/spacing). Pull EXACT values from there.
- **Fix the type ramp first** (extend `typography.ts` to the real 40/52/80px headings + 2px/1px
  letter-spacing, regenerate `theme.css`) and rescope **R4** accordingly — this is the highest-
  leverage fix for the "childish/approximated" look.
- **Harvest `src/theme/css/settings.css`** for the real button/heading/label values.

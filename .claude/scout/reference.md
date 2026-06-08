# EasyTech3D — Reference Catalog (Visual Ground-Truth Index)

> **Purpose:** This is the source-of-truth inventory of the captured reference for the 1:1 Next.js 16 + Tailwind port of **easytech3d.com** (a Shopify theme; locale = Bulgarian `bg`). Use **real values, real class names, real markup, real BG copy** from here. Do NOT approximate with generic Tailwind.
>
> **Reference root:** `c:/Users/lyubomir.pacheliev_o/Documents/projects/easytech3d/tools/output/reference/`
> **Seed:** `https://www.easytech3d.com/` · Crawled 2026-06-08 · sitemap mode · 68 routes captured.
> **Viewports:** desktop screenshots are **1440px** wide; mobile are **780px** wide (390 CSS px @2x DPR). Every page has `desktop.png` + `mobile.png` + `mobile-menu-open.png`.

---

## 0. Top-level files in the reference root

| File | What it is | How to use |
|------|-----------|-----------|
| `design-data.json` (1.0 MB) | Per-page **digest**: computed typography, colors, spacing, section-tree, nav, component counts. 68 page objects under `.pages[]`. | Primary structured data. Shape below. |
| `design-notes.md` (302 KB) | Human-readable dump of the same digests. | Skim companion. |
| `routes.json` (14 KB) | The 68 crawled routes with `type` + `source`. typeCounts: home 1, page 6, collection 21, blog 14, product 16. | Route → template map. |
| `sitemap-all.json` (17 KB) | Full discovered sitemap. | Completeness check. |
| `gap-check.json` | Coverage check vs hubs. **`realMissing: []`** (nothing important missed). `noiseMissing` = atom feeds / tag pages / liquid-error noise only. | Confirms capture is complete. |
| `mirror/` | **Full static mirror** of the live site incl. real theme CSS/JS/fonts/images. THE asset goldmine. | See §5. |
| `pages/<slug>/` | Per-route screenshots + `page.html` (rendered DOM). | See §1–§2. |

### `design-data.json` shape
```
{ seed, pages: [ {
    route:  { url, type, depth, source },
    slug:   "<dir name under pages/>",
    captured: ["desktop","mobile","mobile-menu-open"],
    actions: [ {viewport, type:"cookie|scroll|menu", ...} ],
    digest: {
      url, title, lang, pageHeight,
      typography: [ {family, size, weight, lineHeight, count} ],   // sorted by frequency
      colors:     [ {color:"rgb(...)", prop, weight, count} ],
      spacing:    { paddings:[{value,count}], margins:[...], borderRadii:[...] },
      layout:     { sections:[ {seq, tag, classes[], id, x, y, dimensions:{w,h}, childTagCounts, headings:[{level,text}], file} ] },
      components: { buttons, links, inputs, forms, images, iframes, videos },
      nav:        { items:[ {text, href} ] }
    }
} ] }
```
Each `digest.layout.sections[].file` points to the matching `sections/NN-*.png` for that page.

---

## 1. Screenshot inventory — what exists per `pages/<slug>/`

Every one of the 68 slugs has: `desktop.png`, `mobile.png`, `mobile-menu-open.png`, `page.html`, and a `sections/` folder. Section screenshot sets by template:

- **home** (`root`): 9 sections — `01-header-siteheader`, `02..04-section` (filament/parts tabs), `05-section-fadeinanimation` (categories carousel), `06-section` (why-buy), `07-section` (blog), `08-section-fadeinanimation` (newsletter), `09-footer-sitefooter`.
- **collection** (×24): `01-header-siteheader`, `02-header-collectionheader`, `03-footer-sitefooter`.
- **product** (×16): `01-header-siteheader`, `02-section-shopifysection` (the product template), `03-footer-sitefooter`.
- **blog index + article** (×14): `01-header-siteheader`, `02-section`, `03-footer-sitefooter`.
- **contact**: `01-header-siteheader`, `02-section`, `03-footer-sitefooter`.
- **cart / search / 404 / sitemap pages / policies**: `01-header-siteheader`, `02-footer-sitefooter` (no body section — content is between header and footer).

---

## 2. Slug → Route map (all 68)

Cyrillic URL segments are dir-encoded as `D0-XX-D1-XX` byte sequences with an 8-hex disambiguation suffix. Full table:

| slug (dir under `pages/`) | type | route path | pageHeight | #sections |
|---|---|---|---|---|
| `root` | **home** | `/` | 6350 | 9 |
| `pages-D0-BE-...-0c3c2dce` | page | `/pages/общи-условия` | 8565 | 2 |
| `pages-blog-sitemap` | page | `/pages/blog-sitemap` | 796 | 2 |
| `pages-collection-sitemap` | page | `/pages/collection-sitemap` | 1130 | 2 |
| `pages-contact` | page | `/pages/contact` | 2080 | 3 |
| `pages-page-sitemap` | page | `/pages/page-sitemap` | 866 | 2 |
| `pages-sitemap` | page | `/pages/sitemap` | 1382 | 2 |
| `pages-3d-D0-BF-...-6d53f173` | page | `/pages/3d-принт-при-поръчка` | 1286 | 2 |
| `collections` | collection | `/collections` | 4084 | 3 |
| `collections-all` | collection | `/collections/all` (title "Products") | 4082 | 3 |
| `collections-3-D0-B4-...-2badf7d8` | collection | `/collections/3д-принтери` | 1472 | 3 |
| `collections-3d-printer-beds` | collection | `/collections/3d-printer-beds` | 2605 | 3 |
| `collections-3d-printer-parts` | collection | `/collections/3d-printer-parts` | 5265 | 3 |
| `collections-3dline-pla-filaments` | collection | `/collections/3dline-pla-filaments` | 4577 | 3 |
| `collections-abs` | collection | `/collections/abs` | 2094 | 3 |
| `collections-all-filaments` | collection | `/collections/all-filaments` | 4844 | 3 |
| `collections-asa` | collection | `/collections/asa` | 2190 | 3 |
| `collections-bl-touches` | collection | `/collections/bl-touches` | 1989 | 3 |
| `collections-clamps` | collection | `/collections/clamps` | 1737 | 3 |
| `collections-hitpla-filaments` | collection | `/collections/hitpla-filaments` | 1520 | 3 |
| `collections-hitpla-D1-84-...-de768662` | collection | `/collections/hitpla-филаменти` | 1520 | 3 |
| `collections-nature3d` | collection | `/collections/nature3d` | 4185 | 3 |
| `collections-nature3d-abs` | collection | `/collections/nature3d-abs` | 2600 | 3 |
| `collections-nozzles` | collection | `/collections/nozzles` | 3470 | 3 |
| `collections-petg` | collection | `/collections/petg` | 2070 | 3 |
| `collections-pla-aromatic` | collection | `/collections/pla-aromatic` | 1800 | 3 |
| `collections-pla-filaments` | collection | `/collections/pla-filaments` | 4344 | 3 |
| `collections-pla-flex` | collection | `/collections/pla-flex` | 2176 | 3 |
| `collections-pla-pro-filaments` | collection | `/collections/pla-pro-filaments` | 2289 | 3 |
| `collections-re3d` | collection | `/collections/re3d` | 4379 | 3 |
| `collections-resins` | collection | `/collections/resins` | 1448 | 3 |
| `collections-ultrahitpla-filaments` | collection | `/collections/ultrahitpla-filaments` | 1472 | 3 |
| `blogs-3-D0-B4-...-D0-B2-D0-B5` | **blog index** | `/blogs/3д-принтове` | 4428 | 3 |
| `blogs-...-69daac4c` | article | `/blogs/3д-принтове/бъдещето-на-производството-с-технологията-rlp` | 3662 | 3 |
| `blogs-...-4a688dc1` | article | `/blogs/3д-принтове/партньорство-между-e3d-и-bambu-lab-...` | 4402 | 3 |
| `blogs-...-c8ed9f25` | article | `/blogs/3д-принтове/прогнози-на-експертите-за-3d-принтирането-през-2024-г-...` | 6864 | 3 |
| `blogs-...-787337e9` | article | `/blogs/3д-принтове/проектиране-и-отпечатване-на-съвършени-резби-...` | 4647 | 3 |
| `blogs-...-d564e6f5` | article | `/blogs/3д-принтове/революцията-на-3d-принтера` | 2831 | 3 |
| `blogs-...-6931ee6c` | article | `/blogs/3д-принтове/типове-3d-принтери` | 2615 | 3 |
| `blogs-...-3d-6c28afd8` | article | `/blogs/3д-принтове/3d-принтиране-за-новонавлизащи` | 2687 | 3 |
| `blogs-...-3d-bae7043f` | article | `/blogs/3д-принтове/3d-printers-5-models` | 5015 | 3 |
| `blogs-...-3d-422c7a40` | article | `/blogs/3д-принтове/3dline-hitpla-най-добрата-нишка-...` | 2824 | 3 |
| `blogs-...-di-50fe5dec` | article | `/blogs/3д-принтове/dimafix-спрей-за-по-добро-залепване` | 4424 | 3 |
| `blogs-...-gr-3fc2ac15` | article | `/blogs/3д-принтове/greenboys-extruder` | 3415 | 3 |
| `blogs-...-ka-5d59bbf4` | article | `/blogs/3д-принтове/kak-raboti` | 5156 | 3 |
| `blogs-...-pl-b6b9630d` | article | `/blogs/3д-принтове/pla-срещу-pla-филамент` | 2519 | 3 |
| `products-D0-BC-...-1eda94f7` | product | `/products/меден-nv6-heating-block-за-вашия-3d-принтер` | 3738 | 3 |
| `products-3dline-pla-black-filament` | product | `/products/3dline-pla-black-filament` | 2890 | 3 |
| `products-3dline-pla-intense-light-pink` | product | `/products/3dline-pla-intense-light-pink` | 2767 | 3 |
| `products-3dline-pla-pink-pearl` | product | `/products/3dline-pla-pink-pearl` | 2890 | 3 |
| `products-aluminium-heated-block-...-844a7f54` | product | `/products/aluminium-heated-block-стабилност-...` | 3713 | 3 |
| `products-creativity-3d-printer-part-...-c59dda19` | product | `/products/creativity-3d-printer-part-black-hot-bed-...` | 3381 | 3 |
| `products-elegoo-pla-red-filament` | product | `/products/elegoo-pla-red-filament` | 3369 | 3 |
| `products-nature3d-1-75mm-1kg-pla-green-matte-filament` | product | `/products/...green-matte...` | 3098 | 3 |
| `products-nature3d-1-75mm-1kg-pla-yellow-matte-filament` | product | `/products/...yellow-matte...` | 3165 | 3 |
| `products-nature3d-asa-green` | product | `/products/nature3d-asa-green` | 3652 | 3 |
| `products-nature3d-pla-1-75mm-1kg-tangerine` | product | `/products/...tangerine` | 3308 | 3 |
| `products-nature3d-pla-flex-white-filament` | product | `/products/nature3d-pla-flex-white-filament` | 3263 | 3 |
| `products-nature3d-pla-sparkle-black` | product | `/products/nature3d-pla-sparkle-black` | 3477 | 3 |
| `products-needles-for-cleaning` | product | `/products/needles-for-cleaning` | 4278 | 3 |
| `products-pla-re3d-apple` | product | `/products/pla-re3d-apple` | 3664 | 3 |
| `products-re3d-sinyo-pla` | product | `/products/re3d-sinyo-pla` | 3577 | 3 |
| `policies-privacy-policy` | policy | `/policies/privacy-policy` | 9092 | 2 |
| `policies-terms-of-service` | policy | `/policies/terms-of-service` | 9000 | 2 |
| `policies-refund-policy` | policy | `/policies/refund-policy` | 2215 | 2 |
| `cart` | system | `/cart` | 1023 | 2 |
| `search-q-pla` | system | `/search?q=pla` | 5162 | 2 |
| `404-page-not-found-reference` | system | `/404...` | 1286 | 2 |

---

## 3. DESIGN TOKENS (exact, from home `page.html` inline `<style>` + computed digest)

### 3.1 Color system (theme CSS variables — copy verbatim)
| Variable | Value | Role |
|---|---|---|
| `--color-btn-primary` | `#ff1b5c` | **Brand pink** — primary buttons, cart, active tabs, links-hover, breadcrumb |
| `--color-btn-primary-darker` / `--color-btn-primary-focus` | `#e70042` | primary hover/focus |
| `--header_nav_hover_link` / `--breadcrumbs_color` | `#ff1b5c` / `#FF1B5C` | nav hover, breadcrumb |
| `--color-btn-secondary` | `#3a3a3a` | secondary dark button |
| `--color-btn-secondary-focus` | `#606060` | |
| `--color-text` / `--color-body-text` | `#232323` (rgb 35,35,35) | **Body text** (dominant, 808 nodes) |
| `--color-text-rgb` | `35, 35, 35` | |
| `--white-color` / `--color-btn-primary-text` | `#ffffff` | |
| `--color-body` / `--color-bg` | `#f4f4f4` (rgb 244,244,244) | **Page background** (light grey) |
| `--color-bg-alt` | `rgba(35,35,35,0.05)` | |
| `--color-border` | `#ebebeb` | hairline borders |
| `--color-border-form` | `#cccccc` | input borders |
| `--color-sale-text` | `#EA0606` | sale / strike pricing red |
| `--product_label_sale_color` | `#00a500` | green "На промоция" pill |
| `--product_label_sold_out_color` | `#8a9297` | grey sold-out |
| `--product_label_1_color` | `#0774d7` | blue label |
| `--rte__link_color` | `#000` | RTE links |
| `--rating-star-bg` | `rgba(35,35,35,0.15)` | empty rating star |
| header/megamenu/search bg | `#ffffff` | white header surfaces |
| footer | **near-black** `#333`/`#000` (computed `rgb(51,51,51)` bg, white text) | dark footer |
| announcement bar | **orange** ≈ `rgb(253,91,42)` / `#fd5b2a` | top promo strip |

Computed color frequency (home, from digest, top entries): `rgb(35,35,35)` text ×808; `rgb(255,255,255)` bg ×47; `rgb(244,244,244)` bg ×4; `rgb(255,27,92)` bg ×40 (pink); `rgb(51,51,51)` bg ×120 (dark footer/buttons); `rgb(253,91,42)` bg ×1 (announcement).

### 3.2 Typography
**Fonts (self-hosted woff2 in `mirror/cdn/fonts/`):**
- Body / headings: **Instrument Sans** — `--font-stack-body: "Instrument Sans", sans-serif`, `--font-stack-header: "Instrument Sans", sans-serif` (weight 700 headings).
- Navigation: **Archivo Narrow** — `--font-stack-navigation: "Archivo Narrow", sans-serif` (weight 400).
- Weights available: Instrument Sans n4/n7/i4/i7 (400/700, normal+italic); Archivo Narrow n4.

**Type scale (CSS vars, unitless = px):**
```
--font-size-base: 16        --font-size-navigation: 16   --font-size-header: 40
--font-h1-desktop: 80  / --font-h1-mobile: 56
--font-h2-desktop: 52  / --font-h2-mobile: 40
--font-h3-desktop: 40  / --font-h3-mobile: 26
--font-h4-desktop: 22  / --font-h4-mobile: 19
--font-h5-desktop: 18  / --font-h5-mobile: 18
--font-h6-desktop: 16  / --font-h6-mobile: 14
--font-mega-title-large-desktop: 100
--font-rich-text-large: 18 / --font-rich-text-small: 14
--heading-line-height: 1
--heading1-letter-spacing: 2px  / h2: 2px / h3: 1px / h4: 1px / h5/h6: 0.5px
--font-weight-header: 700   --font-weight-body: 400   --font-weight-navigation: 400
```
**Computed (home, most frequent first):** `Instrument Sans 16/24 w700` ×36; `16/22.4 w700` ×32; `22/22 w700` ×14; `15/22.5 w400` ×13; `22/22 w400` ×13; `Archivo Narrow 16/24 w400` ×7 (nav); `32/32 w700` ×7; `46.8/46.8 w700` ×6 (section H2 actual rendered); `14/14 w700` ×5; `100/100 w700` ×4 (mega-title); `24/36 w700` ×3; `13.5/13.5 w700` ×3.

### 3.3 Spacing & radii (computed, home)
- **Paddings (px, by freq):** 20 ×122, 5 ×76, 13 ×66, 10 ×39, 55 ×36, 30 ×35, 23 ×32, 15 ×21, 4, 11, 3, 40.
- **Margins (px):** 10 ×57, 5 ×53, 15 ×44, -1 ×40, 17.5 ×32, 20, 14, 12, 80, -200, 90.
- **Border-radii:** `20px` ×36 (cards/pills), `50px` ×36 (buttons — fully rounded), `50%` ×26 (circles: cart, social, feature icons), `10px` ×9, `3px`.
- **Layout widths:** content max-width ≈ `1280px` (centered in 1440 viewport); inner content/forms cap at `750px`/`480px`. announcement-bar-height `40px`; header-height `253px` (cart) / `240px` body offset.

---

## 4. SHARED CHROME — exact markup, copy, structure

### 4.1 Announcement bar (top, orange)
- Text: **`EasyTech3d – Партньор във Вашия Творчески Свят`** (italic, white on orange `#fd5b2a`). Height 40px.

### 4.2 Header `<header class="site-header logo--inline">` (height ~240px region)
Three rows:
1. Top-right utility: **`Моят Акаунт`** (My Account link), bold.
2. Logo (left) + main nav (center). Logo = `mirror/cdn/shop/files/logo_100x.jpg` (orange rounded-square "Easy Tech" gear/circuit mark). Nav items (Archivo Narrow, uppercase): **`НАЧАЛО` `ВСИЧКИ КАТЕГОРИИ` `ФИЛАМЕНТИ ▾` `РЕЗИНИ` `ЧАСТИ` `КОНТАКТ` `3D ПРИНТ ПРИ ПОРЪЧКА`**.
3. Search row: pink rounded pill **`Всички Категории ⌄`** (category dropdown) + search input placeholder **`Търсене`** + search (magnifier) icon + **pink circular cart** (count badge `0`).
- Nav `digest.nav.items` (12 links, the ФИЛАМЕНТИ mega-menu): `Начало → /` · `Всички категории → /collections` · `Филаменти → /collections/all-filaments` · `PLA → /collections/pla-filaments` · `Nature3D` · `RE3D → /collections/re3d` · `3DLine → /collections/3dline-pla-filaments` · `Elegoo → /search?q=Elegoo*` · `Всички → /collections/pla-filaments` · `PETG → /collections/petg` · `PLA Pro → /collections/pla-pro-filaments` · `PLA Flex → /collections/pla-flex`.
- Mobile: see `*/mobile-menu-open.png` for the hamburger drawer (off-canvas).

### 4.3 Footer `<footer class="site-footer critical-hidden">` (dark, height ~285px)
- Dark `#333`/black bg, white/`#ebebeb` text. Three blocks:
  - **`Последвайте ни`** + social circle icons: Facebook, Twitter, Pinterest.
  - **`Бързи Линкове`**: `Поверителност`, `Условия за ползване`, `Sitemap`, `Refund Policy`.
  - Copyright: **`all rights reserved @ easytech3d`**.

---

## 5. `mirror/` — real assets to reuse (do NOT re-create)

```
mirror/
  index.html / _index.html        — rendered home
  collections/ products/ blogs/ pages/ policies/ cart/ search/ 404...  — mirrored routes
  cdn/
    fonts/instrument_sans/*.woff2   (n4,n7,i4,i7)
    fonts/archivo_narrow/archivonarrow_n4.*.woff2
    shop/t/5/assets/                — THE THEME SOURCE:
        theme.css (208 KB)  theme.js (198 KB)  vendor.js (102 KB)
        core.css (79 KB)    core.js  collection-page.css/js  cart-page.css
        component-rating.css  flickity.min.css  photoswipe.css  default-skin.css
        ico-select.svg  plus.png  minus.png  ajax-loader.gif  dynamic-icon.js
    shop/files/                     — product/brand imagery (logo_100x.jpg, baner_sait_1500x.jpg,
                                       baner_2_1500x.webp, *_HPLA/UHPLA/PLA *_1500x.webp/jpg, etc.)
    shopifycloud/ ...               — Shopify platform JS (checkout, shop-pay, privacy-banner) — ignore for the port
```
- **Pull real CSS class behavior from `theme.css`/`core.css`** (minified). Key class families seen: `.site-header.logo--inline`, `.btn--primary/.btn--secondary/.btn--white/.btn--circle-arrow`, `.index-tabs-collections-wrapper .index-tabs_nav--item` (active underline = brand pink), `.product-item-block .product-card`, `.collection-header`, `.fade-in-animation/.fadeIn-animation`, `.section_style_carousel .image_style_circle`, `.contact-form .btn{max-width:225px}`, `.article-page .article-social-sharing .btn--share`.
- **moneyFormat:** `"{{amount}} eur EUR"` (also `moneyFormatWithCurrency`). Prices render dual: `27.00 лв / 13.77 €` with struck regular `35.00 eur EUR`.

---

## 6. PER-TEMPLATE BUILD SPECS + BEST reference screenshot

For each template the section tree comes from `design-data.json`; the **BEST** screenshot is the single most representative capture for 1:1 rebuild.

### HOME — slug `root`
**BEST:** `pages/root/desktop.png` (1440×6350, full page). Section crops in `pages/root/sections/`.
Section tree (9):
1. `01-header-siteheader` — chrome (§4.2).
2. `02-section` **"Филаменти за 3D принтер"** — tabbed product carousel. Tabs (H3): `PLA Pro Филамент` (active, pink underline) · `PLA Филамент` · `PETG Филамент`, with ◄ ► circle arrows top-right. Eyebrow `— НАЙ-ПОПУЛЯРНИ`. Product cards: white, radius 20px; green pill `На промоция от: 23%!`; title; dual price `27.00 лв / 13.77 €` + struck `35.00 eur EUR`; two stacked pink full-width buttons **`Добави в количката`** (cart icon) and **`Бърза преглед`**.
3. `03-section` — same tabbed pattern, tabs `PLA Flex` / `ABS` / `ASA`.
4. `04-section` **"Резервни части за 3D принтери"** — tabs `Дюзи` / `Легла` / `BL Тъчове`.
5. `05-section-fadeinanimation` **"Всички Категории"** — `section_style_carousel image_style_circle` (circular category tiles carousel).
6. `06-section` **"Защо да купувате от нас?"** — eyebrow `— ОТ ЕНТУСИАСТИ ЗА ЕНТУСИАСТИ`, huge centered H2 (rendered ~46.8px bold). 3 feature columns, each = pink-tinted circle icon + bold title + grey body:
   - `Ниски Цени` — "Целим се да направим 3Д принтирането по достъпно за българската общност"
   - `Бързи Доставки` — "Поръчките се изпращат на същия ден, за да можете възможно най-скоро да се завърнете към проектите си"
   - `Поддръжка` — "Ако имате въпроси относно нашите продукти и използването им, свържете се с нас чрез формата за контакти с какъвто и да е въпрос."
   - (icon color override: `#ff1b5c`)
7. `07-section` **"Проверете нашият блог"** — featured `<article class="article_block">` cards.
8. `08-section-fadeinanimation` **"Абонирайте се към нашият мейл лист"** — sub: "Получавайте известия за промоции, нови продукти, евенти, развития в 3D принтинг светът и други"; email input + submit.
9. `09-footer-sitefooter` — chrome (§4.3).
*(Also a JS popup app: announcement popup `PLA? А защо не, PLA PRO?` / `Намаление на всички PLA Pro филаменти`, coupon `DISCOUNT20` — optional.)*

### COLLECTION — best slug `collections-pla-filaments` (rich, 100 products)
**BEST:** `pages/collections-pla-filaments/desktop.png` (1440×4344). Header crop `sections/02-header-collectionheader.png`.
Tree (3): header · `collection-header` · footer.
`collection-header` markup: pink breadcrumb **`Начало › PLA Филаменти`**; big H1 `PLA Филаменти`; grey count **`100 продукти`**; right: **grid / list view-mode toggle** icons. Below header = product grid (same card as home §HOME-2). Has filter sidebar + sort (inputs:114/forms:21 on this page). Empty/edge example: `collections-3д-принтери` shows `1 резултат`.
Other good collection refs: `collections-all` (title "Products"), `collections-3d-printer-parts` (tall, 5265px — many items).

### PRODUCT — best slug `products-nature3d-pla-sparkle-black` (full rich body)
**BEST:** `pages/products-nature3d-pla-sparkle-black/desktop.png` (1440×3477). Body crop `sections/02-section-shopifysection.png` (`shopify-section section-product-template`).
Layout: breadcrumb top; **left** = main image + thumbnail strip (flickity carousel) with `Бърз преглед` zoom; **right** = H1 product title `Nature3D PLA Черен филамент, блестящ {Sparkle}`, **dual price** `30.00 лв / 15.30 €`, `ДДС Включено`, quantity stepper `Количество [- 1 +]`, pink **`Добави в количката`** button + secondary **`Buy it now`** (Shop Pay). Below: rich-text body with H2 marketing block, H3 sections `✅ Основни характеристики:` (bullet specs: Цвят / Диаметър 1.75 mm / Тегло 1 кг / Материал 100% / Температура), `🎯 Защо да избереш Nature3D PLA Sparkle?`, then **`Клиентски Отзиви`** reviews block (`Добавете отзив`). Simpler product ref: `products-3dline-pla-black-filament` (H1 `3DLine PLA Филамент - Черно`).

### CART — slug `cart`
**BEST:** `pages/cart/desktop.png` (1440×1023) — captured **empty**. H1 **`Количка`**; body **`Количката е празна. ;(`**; pink pill CTA **`Обратно в начало →`**. Title `Your Shopping Cart`. (For a filled cart use `cart-page.css` classes; translation strings in §7.)

### SEARCH — slug `search-q-pla`
**BEST:** `pages/search-q-pla/desktop.png` (1440×5162). Title **`Резултати на търсенето: 117 резултати за "pla"`**. Header + results grid (same product cards) + footer; has filters (inputs:76/forms:15). One-result string: `1 резултат намерен`.

### BLOG INDEX — slug `blogs-3-...-D0-B2-D0-B5` (`/blogs/3д-принтове`)
**BEST:** `pages/blogs-3-D0-B4-D0-BF-D1-80-D0-B8-D0-BD-D1-82-D0-BE-D0-B2-D0-B5/desktop.png` (1440×4428). Title `Нови Тенденции в Света на 3D Принтирането`. One tall `02-section` (3711px) listing article cards (image + title + excerpt).

### ARTICLE — best slug `blogs-...-d564e6f5` (`/революцията-на-3d-принтера`, compact 2831px) or `blogs-...-69daac4c`
**BEST:** `pages/blogs-3-D0-B4-...-d564e6f5/desktop.png`. Article template: hero/title, RTE body, `.article-social-sharing .social-sharing .btn--share` (Facebook/Twitter/Pinterest share). 14 article captures available (heights 2519–6864px).

### CONTACT — slug `pages-contact`
**BEST:** `pages/pages-contact/desktop.png` (1440×2080). `02-section` H2 **`Свържете се с нас`** = contact form (inputs:12/forms:4) + Google-map iframe. `.contact-form .btn{max-width:225px}`.

### 404 — slug `404-page-not-found-reference`
**BEST:** `pages/404-page-not-found-reference/desktop.png` (1440×1286). Title `404 Not Found`. Header + minimal body + footer.

### POLICIES / SITEMAP PAGES
Long RTE pages, header+footer only: `policies-privacy-policy` (9092px), `policies-terms-of-service` (9000px), `policies-refund-policy` (2215px); `pages-sitemap`, `pages-blog-sitemap`, `pages-collection-sitemap`, `pages-page-sitemap` (auto link lists); `pages-D0-...-0c3c2dce` = `/pages/общи-условия` (8565px, T&Cs); `pages-3d-...-6d53f173` = `/pages/3d-принт-при-поръчка` (print-on-demand info).

---

## 7. UI string dictionary (Bulgarian — from theme JS `window.theme.strings`, use verbatim)

| Key | BG string |
|---|---|
| Add to cart | `Добави в количката` |
| Added | `Добавено!` |
| Quick view | `Бърза преглед` / `Бърз преглед` |
| Continue shopping | `Продължете пазаруването` |
| Buy now | `Buy it now` |
| Pre-order | `Предварителна поръчка` ("Това е артикул за предварителна поръчка...") |
| Sold out / Unavailable | `Изпродадено` / `Неналично` |
| Regular price / Sale price / Sale | `Нормална цена` / `Цена` / `Промоция` |
| From [price] | `от [price]` |
| Vendor | `Доставчик` |
| Show more / less | `Покажи още` / `Покажи по малко` |
| Quantity | `Количество` (label `Количество: [count]`) |
| Cart count | `1 артикул` / `[count] артикули` |
| Cart error | `Получи се грешка при актуализирането на количката. Моля, опитайте пак.` |
| Totals | `Тотал Спестени` (saved) / `Обща Сума` (regular) |
| Update | `Актуализиране` |
| Add note | `Добави съобщение` / `Съобщение добавено` |
| Search results | `[results_count] results found` / `1 резултат намерен` |
| Popular products / searches | `Популярни продукти` / `Популарни търсения` |
| Loading | `Зареждане` |
| Newsletter success | `Благодарим за абонирането!` |
| Pick an option | `Избери опция` |
| Shipping to | `Доставяне до` |
| Account | `Моят Акаунт` · Reviews: `Клиентски Отзиви` / `Добавете отзив` / `Готово` |

---

## 8. Build order / fidelity checklist
1. Tokens first: install **Instrument Sans** + **Archivo Narrow** (woff2 in `mirror/cdn/fonts/`); set CSS vars from §3 (`#ff1b5c`, `#232323`, `#f4f4f4`, `#3a3a3a`, fully-rounded `50px` buttons, `20px` cards, `50%` circles).
2. Shared chrome: announcement bar (orange) → header (white, `logo--inline`, category pill + search + pink cart) → dark footer. Use exact BG copy from §4.
3. Templates in order of reuse: product-card → home tabbed carousels → collection grid+header → product page → cart/search → blog/article → contact → policies/404.
4. Cross-check every component against the **BEST** screenshot in §6 and the section crops; pull real spacing/markup from `page.html` + `theme.css`. Prices are dual `лв / €` per moneyFormat `{{amount}} eur EUR`.

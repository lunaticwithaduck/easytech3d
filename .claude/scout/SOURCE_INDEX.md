# EasyTech3D — MASTER SOURCE INDEX (authoritative 1:1 rebuild map)

> Single authoritative map for the faithful 1:1 port of **easytech3d.com** (Bulgarian Shopify
> "Expanse/Warehouse"-derived theme, preset Telluride) into **Next.js 16 + Tailwind**.
> Compiled from the 6 scout files in `.claude/scout/`: `liquid.md`, `theme-css.md`, `theme-js.md`,
> `reference.md`, `config-copy.md`, `scaffold.md`. **Use real values/markup, never guess.**
>
> ### Authoritative source roots
> - **Liquid theme** (markup/copy/order): `c:/Users/lyubomir.pacheliev_o/Downloads/theme/` (also mirrored `tools/output/liquid-template/`)
> - **Real theme CSS/JS/fonts/images**: `tools/output/reference/mirror/cdn/shop/t/5/assets/`
> - **Reference screenshots + rendered DOM**: `tools/output/reference/pages/<slug>/{desktop,mobile,mobile-menu-open}.png`, `page.html`, `sections/NN-*.png`
> - **Structured per-page digest**: `tools/output/reference/design-data.json` (+ `design-notes.md`)
> - **Real design tokens (orphaned in repo)**: `src/theme/css/settings.css`
> - **Existing scaffold to re-skin**: `src/features/**`, `src/design-system/**`, `src/server/catalog/**`
>
> ### CRITICAL CROSS-FILE CONFLICTS (resolve as noted)
> 1. **FONT.** `config-copy.md`/`liquid.md` (theme settings) say heading font = **Neue Haas Unica** (`neue_haas_unica_n7`), nav = **Archivo Narrow**. `reference.md`/`theme-css.md`/`scaffold.md` (live capture) say the live site renders **Instrument Sans** (`--font-stack-header/body: "Instrument Sans"`), nav still **Archivo Narrow 400**. **→ LIVE CAPTURE WINS (per BUILD_CONTRACT): use Instrument Sans for headings+body, Archivo Narrow 400 for nav.** Self-hosted woff2 at `mirror/cdn/fonts/{instrument_sans,archivo_narrow}/`.
> 2. **HEADING SIZES.** `theme-css.md` reports core.css `calc()` multipliers that scale raw tokens (h2 renders ≈46.8px = 52×0.9). `reference.md`/`settings.css` give raw token px (h2 52). **→ Token px are the design intent (h1 80 / h2 52 / h3 40 / h4 22 / h5 18 / h6 16 desktop); the rendered ≈46.8 is the same h2 after the 0.9 calc. Use the raw token ramp; the 0.9/0.8 calc factors are an optional fidelity detail.**
> 3. **FREE-SHIPPING THRESHOLD.** Setting `cart_free_shipping_threshold = 105`, but announcement-bar copy says **"над 150лв"**. **→ Display the bar copy (150 лв) as customer-facing; 105 is a stale numeric setting.**
> 4. **SOLD OUT copy.** Grid card = **"Изкупено"**; PDP = **"Изпродадено"**. Both correct, context-dependent.
> 5. **PRICE.** Always dual `"{lev} лв / {euro} €"` (EUR = lev × **0.51**); compare-at (strike) uses plain money. moneyFormat = `"{{amount}} eur EUR"`.

---

# 1. GLOBAL DESIGN SPEC (exact tokens)

### 1.1 Colors
| Token | Value | Role |
|---|---|---|
| `--color-btn-primary` (primary/accent) | **`#ff1b5c`** | buttons, cart icon, active tabs, link hover, breadcrumb |
| `--color-btn-primary-focus` / `-darker` | `#e70042` | primary hover/focus (animated `:after` reveal) |
| `--color-btn-secondary` | `#3a3a3a` | secondary dark button |
| `--color-btn-secondary-focus` | `#606060` | secondary hover |
| `--color-text` / `--color-body-text` | **`#232323`** (rgb 35,35,35) | body + heading text (dominant) |
| `--color-body` / bg | **`#f4f4f4`** (rgb 244,244,244) | page background (off-white) |
| `--white-color` / btn text | `#ffffff` | header/megamenu/search surfaces, button text |
| `--color-border` | `#ebebeb` | hairline borders, soft card shadow color |
| `--color-border-form` | `#cccccc` | input borders |
| `--color-sale-text` / `--color-sale` | `#EA0606` | sale price / strike red |
| `product_label_sale_color` | **`#00a500`** (green) | "На промоция от: N%!" pill |
| `product_label_sold_out_color` | `#8a9297` (grey) | sold-out label |
| `product_label_1_color` | `#0774d7` (blue) | custom label 1 |
| `product_label_2_color` | `#000` (black) | custom label 2 |
| announcement bar bg / text | **`#fd5b2a`** (orange) / `#ffffff` | top promo strip |
| footer bg / headings / text / links | **`#000000`** / `#ffffff` / `#ebebeb` / `#cccccc` | dark footer (computed `rgb(51,51,51)` near-black) |
| `--rating-star-bg` | `rgba(35,35,35,0.15)` | empty star fill |
| muted UI grey | `#8d8d8d` | slider arrows, count text |
| cart dividers | `#ccc` / `#e0e0e0` | cart row borders / head bg |

### 1.2 Typography
- **Heading + body font:** `"Instrument Sans", sans-serif` (700 headings / 400 body). woff2: `mirror/cdn/fonts/instrument_sans/` (n4,n7,i4,i7).
- **Nav/menu font:** `"Archivo Narrow", sans-serif` (400). woff2: `mirror/cdn/fonts/archivo_narrow/archivonarrow_n4.*.woff2`.
- **Base size:** 16px · **nav size:** 16px · `--font-size-header: 40` · `--heading-line-height: 1` (token) / `1.2` (core.css rendered).
- **Body:** 16px / line-height 1.5 / weight 400 / color `#232323`. `p` margin `0 0 19.44px`, mobile ~15px.

**Heading type scale (raw token px — desktop / mobile · weight 700 · letter-spacing):**
| Tag | Desktop | Mobile | Letter-spacing | calc factor (fidelity) |
|---|---|---|---|---|
| h1 | **80px** | 56px | **2px** | ×1.0 |
| h2 | **52px** | 40px | **2px** | ×0.9 (renders ≈46.8) |
| h3 | **40px** | 26px | **1px** | ×0.8 (renders 32 / ≈20.8) |
| h4 | **22px** | 19px | **1px** | ×1.0 |
| h5 | **18px** | 18px | **0.5px** | ×1.0 |
| h6 | **16px** | 14px | **0.5px** | ×1.0 |
| mega-title--large | **100px** | — | 2px | `(header+20)` |
| body | 16px | ~15px | — (lh 1.5) | — |
| eyebrow (`.section-header .h5`) | **14px** uppercase | 14px | — | base − 2px |

### 1.3 Layout / containers / spacing
| Token | Value |
|---|---|
| `.page-width` max | **1660px**, padding `0 55px`, centered |
| `.page-width-small` max | **1280px**, padding `0 55px`, centered |
| content cap (forms/text) | `750px` / `480px` |
| section vertical rhythm | `.index-section` padding-bottom **35px**; first index section margin-top 35px (mobile) → 55px (≥750) |
| `.section-header` margin-bottom | **35px** mobile → **55px** (≥750px) |
| `hr` | margin `55px 0`, border-bottom `1px solid #ebebeb` |
| `.empty-page-content` | padding `125px 0` |

### 1.4 Grid system (flexbox, NOT CSS grid)
```css
.grid       { display:flex; flex-wrap:wrap; align-items:flex-start; margin:0 0 0 -11px; }
.grid__item { width:100%; padding-left:11px; }              /* 11px gutter desktop */
@media(max-width:749px){ .grid{margin-left:-22px} .grid__item{padding-left:22px} } /* 22px mobile */
.grid--uniform .grid__item { margin-bottom:20px; }
.grid--no-gutters{margin-left:0}  .grid--half-gutters{margin-left:-15px}
.product-item-block { margin-bottom:30px; }
```
Fractional width classes, responsive-prefixed: `.one-half`=50% · `.one-third`=33.33% · `.one-quarter`=25% · `.one-fifth`=20% · `.one-sixth`=16.67% · `.two-thirds`=66.67% · `.three-quarters`=75% · `.one-twelfth`=8.33% (+ tenths, eighths, full 12-col, `--push-*` offsets). Prefixes: `.small--` (<749) · `.medium-up--` (≥750) · `.tablet--` (750–1199) · `.desk--` (≥1200) · `.mobile--` (<480). Example 4-up product grid = `.grid__item.medium-up--one-quarter.small--one-half`.

### 1.5 Breakpoints (`theme.breakpoints` = {medium:750, large:990, widescreen:1400})
- mobile `max-width:480px` (`.mobile--*`)
- **small/phone `max-width:749px`** (`.small--*`) — PRIMARY mobile cutoff
- tablet `750–1199px` (`.tablet--*`)
- **medium-up `min-width:750px`** (`.medium-up--*`) — THE desktop breakpoint
- desk `1200–1650px` (`.desk--*`); widest ≥1651px

### 1.6 Radii / shadows / misc
| Token | Value | Where |
|---|---|---|
| Button radius | **50px** (pill) | `.btn` |
| Card radius | **20px** | `.product-card`, `.collection-grid-item`, cart blocks |
| Media/small radius | 10px | blog cards, dropdowns, logo tiles |
| Input radius (default) | 2px | core inputs |
| Input radius (pill forms) | 20px / 50px | cart, search, footer |
| Label radius | 20px | `.product-label` |
| Swatch | 50% (18px circle) | `.color-swatch__item` |
| Circle slider arrow | 50%, 44×44px (logo-bar 55, back-to-top 47) | `.slider_custom_arrows .btn` |
| Soft card shadow | `0 0 4px 2px #ebebeb` | logo tiles, icon circles |
| Layout-button selected | `0 2px 3px 1px #ebebeb` | collection grid/list toggle |
| Slider dot | 65×4px, radius 20px, inactive `#e4e4e4`, active `#ff1b5c` | flickity dots |

### 1.7 Buttons — `.btn` (theme.css wins over core.css)
```css
.btn { border-radius:50px; padding:13px 20px 13px 23px; line-height:1.4;
       display:inline-flex; align-items:center; justify-content:space-between;
       font-family:"Instrument Sans"; font-weight:700; font-size:1em; text-transform:none;
       background:#ff1b5c; color:#fff; position:relative;
       transition:color .3s,background .3s,opacity .3s,border .3s; }
.btn span + svg { margin-left:15px; }                /* trailing arrow icon */
.btn:after { content:""; position:absolute; border-radius:50px; height:0;width:0; left:50%;top:50%; transition:all .3s; }
.btn:not([disabled]):hover:after { height:calc(100%+2px); width:calc(100%+2px); left:-1px; top:-1px; } /* darker reveal */
.btn--primary:after { background:#e70042; }
@media(min-width:750px) and (max-width:989px){ .btn{padding:13px} .btn svg{width:15px;height:15px} }
@media(max-width:480px){ .btn{width:100%} }
```
Variants: `--primary` (#ff1b5c/#fff, hover #e70042) · `--secondary` (#3a3a3a bg+border) · `--white` (#232323 text / #fff bg) · `--transparent_primary` (transparent, #ff1b5c text+border, hover text #fff) · `--transparent_secondary` (transparent, #3a3a3a text+border, hover bg #3a3a3a) · `--small` (padding 8px 10px, 12px) · `--narrow` · `--link` (transparent, #232323, left). Buttons wrap label in `<span>` + trailing `icon 'tail-right'`. Circle arrows `.btn--circle-arrow` = 44px, bg #fff, color #8d8d8d, hover bg #ff1b5c + #fff.

### 1.8 Section header / eyebrow pattern (reused everywhere)
```html
<div class="section-header [text-center] homepage_subtitle_style_match_header">
  <span class="h5">EYEBROW</span>   <!-- 14px uppercase, inline-flex, 25px×2px dash :before, 7px left -->
  <h2>Title</h2>                    <!-- ≈47px desktop / 40px mobile, 700, ls 2px -->
</div>
```
Eyebrow dash color: `#ff1b5c` (primary style) / `#3a3a3a` (secondary) / `#232323` (match_header/default). Tab-nav item active = pink `#ff1b5c` 4px underline (`:after`), inactive opacity 0.5; items `margin-right:90px`.

---

# 2. PER-COMPONENT TABLE

> Liquid root = `c:/Users/lyubomir.pacheliev_o/Downloads/theme/`. JS handlers in `assets/theme.js` (line refs). CSS in `assets/{core,theme,collection-page,cart-page,component-rating}.css`. Screenshots under `tools/output/reference/pages/<slug>/`.

| Component | Liquid source | Key CSS selectors + values | Reference screenshot | JS interaction (handler) | BG copy keys |
|---|---|---|---|---|---|
| **Button** | inline `.btn`+modifier; label in `<span>` + `icon 'tail-right'` | `.btn{radius:50px;padding:13px 20px 13px 23px;bg#ff1b5c;color#fff;700}` · `:after` darker reveal #e70042 · `--secondary`#3a3a3a · `--white` · `--transparent_*` · `--circle-arrow`44px | every page | hover `:after` grow; add-to-cart → `theme.AddItemToCart` (6340) | `Добави в количката`, `Бърз преглед`, `Опции` |
| **ProductCard** | `snippets/product-card-item.liquid` | `.product-card{padding:20px;radius:20px;bg#fff;flex-col;h100%}` · `.product-item-block{mb:30px}` · img `--product-image-height:200px` `object-fit:contain` mb15px · hover-swap `.product-card__image--alternate{opacity0→1}` (≥750px) · `.product-item__price_and_reviews_row{flex;space-between;m:20px 0 10px}` · CTA pinned `margin-top:auto` | `root/sections/02-section.png`; `collections-pla-filaments/desktop.png` | card swatch radio swaps image+link `theme.ProductItemSwatches` (6409); add-to-cart form; quick-view btn `.open-quick-view--btn` | `Добави в количката`/`Изкупено`/`Опции`, `Бърз преглед`, `На промоция от: {savings}!` |
| **PriceTag** (product-price) | `snippets/product-price.liquid`, `product-price-listing.liquid` | `.price{bold}` · `.price__regular .price-item--regular` · `.price__sale .price-item--sale{mr:10px}` + `<s class="price-item--regular">` · `.price__badge--sale/--sold-out` · sale text `#EA0606` | within cards/PDP | none (static) | dual **`{lev} лв / {euro} €`** (euro=lev×0.51); compare = plain money; fallback 1999; `Free` if 0 |
| **SectionHeading** | inline `.section-header` (in every index section) | `.section-header{mb:35px→55px}` · eyebrow `.h5{14px;uppercase;inline-flex}` `:before{w25px;h2px;mr7px;bg per style}` · title `h2` | every section crop | none | eyebrow + title literals per section (§3) |
| **Header** | `sections/header.liquid` (`data-section-type="header-section"`) | `#shopify-section-header{position:absolute;top:var(--announcement-bar-height);z9}` · `.site-header.logo--inline` transparent/overlap · `.header_top__row{flex;padding:13px 20px}` (custom_css 5px) · logo img `border-radius:20px;left:25%` (reset ≤1024) · pink search pill max515 radius50 min-h55 · cart `#HeaderCart.btn--primary` pink circle | `root/sections/01-header-siteheader.png` | `theme.Header.init()` (1934); sets `--header-height`; cart drawer toggle; search toggle | nav UPPERCASE: `НАЧАЛО ВСИЧКИ КАТЕГОРИИ ФИЛАМЕНТИ▾ РЕЗИНИ ЧАСТИ КОНТАКТ 3D ПРИНТ ПРИ ПОРЪЧКА`; `Моят Акаунт`, `Всички Категории`, `Търсене`, `Всичко общо:` |
| **MegaMenu** | `snippets/desktop-menu.liquid`, `mega-menu.liquid` | `.mega-menu>.page-width>.mega-menu__inner.(--left|--center|--large)>.mega_menu_columns__wrapper>.mega-menu__column(span.mega-menu__title.heading + ul.mega-menu__linklist>li>a.mega-menu__link)` + `a.mega-menu__promo` (image+heading+text) · `.second_lvl.nav-dropdown` min-width 760px radius20 pad16 · dropdown links `padding:9px 30px;14px;radius50px` hover #ff1b5c | hover state in screenshots | hover-intent `SV.HoverIntent{exitDelay:300,interval:100,sensitivity:7}` adds `.visible` to `li`; `theme.Header` | nav items data-driven |
| **MobileDrawer** | `header.liquid` `.mobile-nav-wrapper #MobileNav` | off-canvas right (`right:-999px→0`), full-width, `height:100vh`, overlay `rgba(46,45,43,.8)` · panels `.mobile-nav__dropdown[data-parent][data-level]` · state classes `js-menu--is-open`/`sub-nav--is-open`/`third-nav--is-open`/`fourth-nav--is-open` | `*/mobile-menu-open.png` | `theme.MobileNav.init()` (2460): open/close, multi-level push, body scroll-lock, Esc close, mql(750) auto-close | chevron icons; account/selectors footer |
| **AnnouncementBar** | `sections/announcement-bar.liquid` (`data-section-type="announcement-bar"`) | `.AnnouncementBar` bg `#fd5b2a` text #fff h40px · `.AnnouncementBar__Slider`(flickity) · `.AnnouncementBar__Content` · sets `--announcement-bar-height` | `root/desktop.png` top strip | `theme.AnnouncementBar` (5505): flickity autoplay 4s, arrows, no close; equalizes heights | 1) `**Безплатна** доставка за поръчки над **150лв**!` 2) `**EasyTech3d** - ***Партньор във Вашия Творчески Свят***` |
| **Footer** | `sections/footer.liquid` (`data-section-type="footer-section"`) | `.site-footer` bg #000, headings #fff, text #ebebeb, links #ccc · custom_css: `footer{min-height:30px;flex;center;font-size:12px}` · `.site-footer__social-icons` 49×49 circle bg #2b2b2b hover #ff1b5c · widths by block count (1→full…5→one-fifth) | `root/sections/09-footer-sitefooter.png` | static; newsletter form if present | titles `Последвайте ни`, `Бързи Линкове` (menu `footer`), copyright `all rights reserved @ easytech3d`; socials Twitter/Facebook/Pinterest |
| **Breadcrumbs** | `snippets/breadcrumbs.liquid` | `.breadcrumbs>.breadcrumbs__list>.breadcrumbs__item>a.breadcrumbs__link` color `#FF1B5C`; tag chips `.current_tag__item` with `+` sep | collection/product headers | none | `Начало` + per-type trail |
| **ProductCarousel** (featured) | `sections/featured-products.liquid` (`data-section-type="featured-products"`) | `.index-tabs-collections-wrapper` · tabs `.index-tabs_nav--item[data-href]` active underline · `.index-tabs-content_block__slider.slides_{N}[data-flickity-config]` · grid→cell: 2→`one-half`(maxH530) 3→`one-third`(345) 4→`one-quarter`(250) 5→`one-fifth`(195) | `root/sections/02–04-section.png` | `theme.FeaturedProducts` (6152): tabs swap+destroy/init Flickity; custom arrows `.slider_custom_arrows .btn`; flickity `{prevNextButtons:false,wrapAround:true,dragThreshold:15,watchCSS:true,cellAlign:left,pauseAutoPlayOnHover:true,autoPlay:speed*1000,pageDots,groupCells:grid}` | titles/eyebrows per §3 |
| **Hero/Slideshow** | `sections/slideshow.liquid` (`data-section-type="slideshow-section"`) | `.slideshow.slideshow--{height}.mobile-slideshow--{mh}` · slide `.slideshow__slide(--active)` fade · `.slideshow__overlay::before{opacity:{N}%;bg:{color}}` per-slide · text `.slideshow__title.h1.mega-title(--large)` + `.slideshow__subtitle` + `.slideshow__btn.btn--{style}` · controls `.slick-dots`+`.slideshow__arrow.btn--circle-arrow` · **custom_css hides @max-width:750px** | `root/desktop.png` top | `theme.Slideshow`/`SlideshowSection` (2864/8007): **fade** (NOT flickity), autoplay 6000ms, wrap, dots+arrows, keyboard, pause on hover/focus | slides §3 home |
| **CollectionShowcase** (collection-list) | `sections/collection-list.liquid` (`data-section-type="collection-list"`) | `.section_style_carousel.image_style_circle` · `.collection-list__slider.grid[data-flickity-config]` · circle tiles `.collection-grid-item` · grid 5 | `root/sections/05-section-fadeinanimation.png` | `theme.CollectionListSection` (6259): flickity `{wrapAround,cellAlign:left,pageDots:false,watchCSS cond.}`, custom arrows | title `Всички Категории`, btn `Вижте категориите`→/collections |
| **FeatureIcons** (index-icons) | `sections/index-icons-with-text.liquid` | `.icon-with-text--blocks>.icon-with-text--block>.block_icon(load-icon)+.block_info(span.h4+.block_content)` · icon svg color `#ff1b5c` · pink-tint circles | `root/sections/06-section.png` | none | eyebrow `от ентусиасти за ентусиасти`, title `Защо да купувате от нас?`; blocks `Ниски Цени`/`Бързи Доставки`/`Поддръжка` (full copy §3) |
| **FeaturedBlog** | `sections/featured-blog.liquid` | `.featured-blog__slider` or `ul.grid--blog` · card `article.article_block>a.article__link>.article__grid-image-wrapper` + `.article_block_info(span.article__author + a.h4.article__title + .article__grid-meta)` | `root/sections/07-section.png` | `theme.FeaturedBlog` (8373) flickity | title `Проверете нашият блог`, eyebrow `ако се интересувате от развития в принт светът`; author `от {author}` |
| **Newsletter** | `sections/newsletter.liquid` | `.newsletter-section>.page-width-small>.section-header.text-center` + `form 'customer'.contact-form.form-single-field` · `.input-group>input.Form__Input` + `button.btn--primary` · inputs radius50 | `root/sections/08-section-fadeinanimation.png` | Shopify customer form submit | title `Абонирайте се към нашият мейл лист`, subheading "Получавайте известия…", placeholders `Имейл`/`Първо име`/`Фамилно име`, submit `Подай`, success `Благодарим за абонирането!` |
| **Color swatches (card)** | inside `product-card-item.liquid` | `.product-item__swatches{position:absolute;top:20px;right:20px}` · `.color-swatch__item{18px;radius50%}` `:after` ring (gray #eee → active #ff1b5c) · `--view-more` pill | card crops | `theme.ProductItemSwatches` (6409) | `+N` overflow |
| **Star rating** | `snippets` rating (component-rating.css) | `.rating-star:before{content:'★★★★★';linear-gradient(90deg,#ff1b5c var(--percent),--rating-star-bg)}` driven by `--rating`/`--rating-max` | card/PDP | none | `{rating} от {max} звезди` |
| **Product label** | in card | `.product-item__label-list{absolute;top:20px;left:20px}` · `.product-label{outlined pill;padding:5px 15px;radius20;13px;min-w90;border:2px}` · `--on-sale`#EA0606 outline · `--soldout`#8a9297 | card crops | none | `На промоция от: {savings}!`, `Изкупено` |
| **QuickView modal** | `snippets/modal-quick-view.liquid` | `#modal-quick-view.modal>.modal__dialog--stretch>button.modal__close.close-quick-view + .modal__loader + .modal__inner` | — | handler theme.js 9103: fetch `?view=quick-view`, inject, `new theme.Product`, `body.show_overlay`; close on X/overlay/Esc | `Бърз преглед` |
| **Cart drawer** | `snippets/cart-drawer.liquid`, `cart-items.liquid` | `#sidebar-cart.Drawer.Cart-Drawer.show` · `.Drawer__Header`+`.Drawer__Close[data-action=close-drawer]` · `.QuantitySelector{bg;radius50;w120;pad9 15}` · free-ship notice | — | `theme.Cart` (5030): open=`.show`+`body.show_overlay`; qty `/cart/change.js`; rerender fragment; update `.header_cart_count`/`.cart_total_price` | `Количка`, `Плащане`, `Общо в количката`, `Продължете пазаруването`, free-ship `Остават още {amount}…` |

---

# 3. PER-PAGE TABLE

> Template JSON under `templates/`. "Sections" = `data-section-type`. Reference slug under `tools/output/reference/pages/`. Data accessors from `src/server/catalog/data.ts`.

| Route | Template JSON (section order) | Sections used | Reference slug | Data accessors |
|---|---|---|---|---|
| **home** `/` | `index.json`: slideshow → featured-products ×3 → collection-list → index-icons-with-text → slideshow(DISABLED) → logo-bar(DISABLED) → featured-blog → newsletter → apps | slideshow, featured-products, collection-list, index-icons-with-text, featured-blog, newsletter | `root` (desktop 1440×6350) | `homeConfig` (slides, featuredGroups, categoryShowcase, features, blog, newsletter), `getProductsInCollection`, `getCollections`, `getArticles` |
| **collection** `/collections/[handle]` | `collection.json`: `["main"]` → collection-template. view grid, image mode **banner**, breadcrumbs on, overlay #000@40%, grid **3**, grid_mobile 1, rows 6, desc bottom, layout `off_canvas_sidebar`, filters none, pagination standart | collection-template (+ custom_page_header banner, collection-sidebar, product-card-item) | `collections-pla-filaments` (4344) | `getCollection(handle)`, `getProductsInCollection(handle)`, sort/filter params |
| **collections** `/collections` | `list-collections.json`: `["main"]` → list-collections-template. title `Колекции`, breadcrumbs on, display full_image, image height 300, grid **3**, grid_mobile 1, sort products_high | list-collections-template, collections-grid-item, custom_page_header | `collections` (4084) | `getCollections()` |
| **product** `/products/[handle]` | `product.json`: `["main","product-recommendations",newsletter(DISABLED)]`. blocks: sku, title, rating, vendor, price, options, quantity, buttons, back_in_stock, description(full_width). media `medium`, zoom on, thumbnails grid 4, mobile sticky btns | product-template, product-recommendations ("You may also like", grid_mobile 2), media, thumbnails-gallery, swatch, product-price | `products-nature3d-pla-sparkle-black` (3477) | `getProduct(handle)`, `getRelatedProducts(handle)` |
| **cart** `/cart` | `cart.json`: `["main"]` → cart-template. overlay #000@40%, breadcrumbs on, shipping estimator on, default country **Bulgaria** | cart-template (banner `Количка`), cart-items, custom_page_header | `cart` (1023, captured empty) | (mock cart; no live this session) |
| **search** `/search` | `search.json`: `["main"]` → search-page (no settings). `searchMode=product`, paginate by 10 | search-page, search-sidebar, custom_page_header, product-card-item | `search-q-pla` (5162) | `searchProducts(q)` |
| **blog** `/blogs/[blog]` | `blog.json`: `["main"]` → blog-template. blocks search+links(menu). layout **grid** (3/row), breadcrumbs off, tags dropdown on, show date+excerpt, paginate by 12 | blog-template, blog-sidebar, custom_page_header, article cards | `blogs-3д-принтове` (4428) | `getArticles(blog)` |
| **article** `/blogs/[blog]/[slug]` | `article.json`: `["main"]` → article-template. use_featured_image on, breadcrumbs off, overlay #000@40%, show date+author+tags+share | article-template, article_author_block, custom_page_header, social-sharing, comment | `blogs-…-d564e6f5` (revolution, 2831) | `getArticle(blog,slug)` |
| **page** `/pages/[slug]` | `page.json`: `["main"]` → main-page. overlay #000@40%, breadcrumbs off, show content | main-page, custom_page_header | `pages-3d-…` , `pages-общи-условия` | mock page content |
| **contact** `/pages/contact` | `page.contact.json`: `["main", index-icons(DISABLED), slideshow(DISABLED), page-contact]`. page-contact title `Свържете се с нас`, subtitle `Пратете ни мейл`; **custom_css hides phone field** | main-page, page-contact (form 'contact'), custom_page_header | `pages-contact` (2080) | static; contact form |
| **policies** `/policies/[slug]` | (Shopify-rendered policy; header+footer only) | custom_page_header + RTE | `policies-privacy-policy`/`-terms-of-service`/`-refund-policy` | policy content |
| **404** | `404.json`: `["main"]` → main-404 (locale defaults) | main-404 | `404-page-not-found-reference` (1286) | none |

**Shared chrome on every route:** announcement-bar → header → `#PageContainer` (`main#MainContent` + footer) → cart-drawer (unless cart page), back-to-top, modal-quick-view. Banner header (`custom_page_header.liquid`) used by collection/cart/blog/article/page/search/list-collections; absolutely-positioned under announcement bar with overlay `.custom_page_header_opacity{background:{overlay};opacity:{N}%}`.

---

# 4. BUILD ORDER + RISKS

### 4.1 Dependency / build order (low-level → high-level)
1. **Tokens + fonts FIRST.** Install Instrument Sans + Archivo Narrow (woff2 in `mirror/cdn/fonts/`). **Extend `typography.ts` ramp to the real sizes** (h1 80 / h2 52 / h3 40 / mega 100 + mobile 56/40/26) and **real letter-spacing 2px/1px/0.5px**; harvest `src/theme/css/settings.css`; regenerate `theme.css` via `pnpm theme:generate`. (This is the #1 fix for the "childish/undersized" look — the ramp currently caps at 36px.)
2. **Primitives:** Button (pill 50px, hover #e70042, trailing arrow), TextPrice (dual лв/€ ×0.51), Link, Image, Icon (port theme SVGs from `snippets/icon-*.liquid` rather than lucide for true fidelity), Input, Textarea — keep API, reconcile styling.
3. **Shared composed:** SectionHeading (eyebrow+title), PriceTag, ProductCard (white, radius 20, 200px image, hover-alt, swatches, dual price), Breadcrumbs (#FF1B5C), ProductCarousel (Flickity semantics: 4-up desktop, dots+arrows, autoplay, wrap).
4. **Chrome:** AnnouncementBar (orange #fd5b2a, 2 slides) → Header (white, inline logo image radius20/left25%, UPPERCASE nav, pink search+cart, mega-menu hover-intent, mobile drawer) → Footer (black, 3 blocks, 12px centered).
5. **Home sections** (compose carousels/showcase/icons/blog/newsletter + hero fade slideshow hidden <750px).
6. **Collection** (banner header + off-canvas sidebar + grid 3) → **Product** (gallery + variants + dual price + sticky CTA) → **Cart/Search** → **Blog/Article** → **Contact/Page/Policies/404**.

### 4.2 What the convention linter MUST allow (rescope — see `scaffold.md` §5)
- **R4 (CRITICAL):** must permit the real type ramp & spacing. Either extend tokens to include 40/52/80/100px sizes + 2px/1px/0.5px letter-spacing + `--product-image-height:200px` (PREFERRED — keeps R4 strict and faithful values become token classes), or funnel arbitrary values (`text-[80px]`, `tracking-[2px]`, `h-[200px]`, `rounded-[50px]`) through `.styles.ts`. Without this, headings stay capped at 36px = root cause of the approximated look.
- **R1:** sanction per-instance **dynamic** inline values — per-slide overlay opacity (55/40/60%), bg-image URLs, text alignment, adaptive colors — via CSS custom properties (`style={{'--overlay-opacity':…}}`) or a sanctioned `styleProps` escape. `.styles.ts` (CVA) cannot hold per-record runtime values.
- **R3:** soften the `<Text value=>` static-copy heuristic (false-positives on runtime children with quotes); document `dangerouslySetInnerHTML` as the path for RTE `descriptionHtml`/`contentHtml`.
- **R7:** add BG-slug routes to `routes.ts` (`/blogs/3д-принтове`, `/pages/3d-принт-при-поръчка`, `/pages/общи-условия`).

### 4.3 Top fidelity risks
1. **Dual-currency price** everywhere (`лв / €`, ×0.51) — easy to miss on cards/drawer.
2. **Hero is a FADE slideshow (not Flickity) and HIDDEN below 750px** — needs a mobile decision.
3. **Carousels are Flickity with `watchCSS`** (carousel only on desktop; plain scroll/stack on mobile) — reproduce paged 4-up + wrap + custom arrows.
4. **Header is transparent/overlap over the hero on home, solid (`showAlternateHeader`) elsewhere**; track `--announcement-bar-height`/`--header-height`.
5. **Font conflict** (Neue Haas Unica setting vs Instrument Sans live) — use Instrument Sans.
6. **Free-ship 105 vs 150лв copy** — show 150лв.
7. **Icons:** port theme SVGs (`snippets/icon-*.liquid`) for 1:1; lucide is a visible divergence.
8. **`en.default.json` is mislabeled — its values are Bulgarian** (the live storefront copy). Pull UI strings from there, not `bg.json`/`bg-BG.json` (Shopify-internal only).

---

*File: `c:/Users/lyubomir.pacheliev_o/Documents/projects/easytech3d/.claude/scout/SOURCE_INDEX.md`*

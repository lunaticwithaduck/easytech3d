# EasyTech3D — Liquid Markup Source of Truth (SCOUT: liquid)

Theme source: `c:/Users/lyubomir.pacheliev_o/Downloads/theme/`
This is a customized Shopify "Warehouse"-derived theme (preset "Telluride"). Store is Bulgarian (EasyTech3D — 3D printing filaments/parts). All UI copy is Bulgarian via locale chain `bg-BG.json → bg.json → en.default.json`.

**This file is the MARKUP source of truth for a 1:1 Next.js port.** Use the EXACT class names, DOM nesting, and real BG copy below. Do not invent generic Tailwind markup.

---

## 0. GLOBAL FACTS (must internalize before building anything)

### 0.1 Active brand config (from `config/settings_data.json` → `current`)
| Token | Value |
|---|---|
| Primary button / accent (`--color-btn-primary`) | `#ff1b5c` (hot pink/magenta) |
| Nav hover link (`--header_nav_hover_link`) | `#ff1b5c` |
| Breadcrumbs color | `#FF1B5C` |
| Body text (`--color-text`, `--color-body-text`) | `#232323` |
| Body background (`--color-body-bg`) | `#f4f4f4` |
| Header text color | `#232323` |
| AlternateHeader bg / text | `#ffffff` / `#232323` |
| Logo text color | `#232323` |
| Megamenu bg / nav2 bg / search bar bg | `#ffffff` |
| Sale label color | `#00a500` (green) |
| Footer bg | `#000000`; footer headings `#ffffff`; footer text `#ebebeb`; footer links `#cccccc` |
| Announcement bar bg | `#fd5b2a` (orange); text `#ffffff` |
| Header font | `neue_haas_unica_n7` (bold), base size **40px**, letter-spacing **2px**, line-height 1 |
| Body font | `neue_haas_unica_n4`, base size **16px** |
| Menu/nav font | `archivo_narrow_n4`, size 16px |
| Cart type | `drawer` |
| Cart icon style | `cart` |
| Free shipping threshold | `105` (BGN); cart notes enabled |
| Currency code display | `currency_code_enable=false` → prices use bare `money` filter |
| `custom_price0_text` | `"Free"` (shown when price 0) |
| Quick view / color swatch / reviews badge / add-to-cart btn / preorder btn | all ENABLED |
| `align_height=true`, `collection_height=200`, `show_second_image_on_hover=true` |
| Favicon/logo | `logo.jpg`, `logo_max_width=100` |

### 0.2 Breakpoints (from `theme.liquid` `window.theme.breakpoints`)
`medium: 750`, `large: 990`, `widescreen: 1400`. Mobile-up media query boundary is **750px** (`small--` = <750, `medium-up--` = ≥750).

### 0.3 Grid system (Warehouse fractional classes — reproduce as a utility set)
Column-width classes seen everywhere: `grid`, `grid--uniform`, `grid--no-gutters`, `grid--half-gutters`, `grid__item`, and fraction widths:
`medium-up--one-half`, `medium-up--one-third`, `medium-up--one-quarter`, `medium-up--one-fifth`, `medium-up--one-sixth`, `medium-up--two-thirds`, `medium-up--two-fifths`, `medium-up--five-sixths`, `medium-up--six-tenths`, `medium-up--two-twelfths`, `medium-up--ten-twelfths`, `medium-up--four-sixths`, `medium-up--push-one-twelfth`, `medium-up--push-two-tenths`, `tablet--one-quarter`, `tablet--two-thirds`, `small--one-whole`, `small--one-half`, `small--two-fifths`, `small--three-fifths`, `small--hide`, `medium-up--hide`, `mobile--one-whole`, `mobile--one-half`.
Width wrappers: `.page-width` (max content), `.page-width-small` (narrower content). Build these as container utilities.

### 0.4 Button system — `.btn` + modifier
`btn btn--primary` (accent fill), `btn--secondary`, `btn--white`, `btn--transparent_primary`, `btn--transparent_secondary`, `btn--circle-arrow` (round prev/next slider arrows), `btn-gray`, `btn--link`. Buttons usually wrap label in `<span>` and append a trailing icon: `{% include 'icon' with 'tail-right' %}`.

### 0.5 Icon system — `snippets/icon.liquid` (big `{% case icon %}` switch, `class="icon icon--{name}"`, `viewBox` 0 0 30 / 28 / 24, `fill=currentColor`)
Two include styles in markup:
- `{% include 'icon' with 'NAME' %}` and `{%- render 'icon', icon: 'NAME' -%}`
Icon names referenced across sections: `tail-right`, `tail-left`, `chevron-down`, `chevron-right`, `chevron-left`, `arrow-bottom`, `nav-triangle`, `nav-triangle-borderless`, `hamburger`, `hamburger-mobile`, `close`, `search-loop`, `cart`/`basket`, `grid`, `list`, `select-arrow`, `check`, `box`, `play`, `angle-down`, `sale`/`saletag`, `error`, `login`, `pin`, `spinner`, `3d-badge-full-color`, social icons (`facebook`/`twitter`/`pinterest`/`instagram`/`tumblr`/`snapchat`/`youtube`/`vimeo`/`linkedin`/`email`). Also dynamic `<load-icon name="...">` web component (FontAwesome-style names like `money-check`, `truck`, `envelope`, `star`) powered by `assets/dynamic-icon.js`.
Standalone icon snippets also exist: `icon-chevron-down`, `icon-chevron-left`, `icon-close`, `icon-hamburger`, `icon-error`, `icon-login`, `icon-search`, `icon-spinner`, `icon-saletag`, `icon-3d-badge-full-color`, etc.

### 0.6 Layout chain — `layout/theme.liquid`
`<body class="template-{page_type} ...">` →
1. `{% section 'announcement-bar' %}`
2. `{% section 'header' %}`
3. `<div id="PageContainer" class="page-container drawer-page-content">`
   - `<main id="MainContent" class="main-content js-focus-hidden">{{ content_for_layout }}</main>`
   - `{% section 'footer' %}`
4. `{% include 'pswp' %}` (photoswipe), `{% include 'back-to-the-top' %}`, `{% render 'cart-drawer' %}` (unless cart page), `cookie_popup`, `entry-popup`, `modal-quick-view`.
CSS: loads `flickity.min.css`, `core.css`, `theme.css`, plus inline `css-variables.liquid` (`:root` custom props). Sliders use **Flickity**. JS: `delegate.js`, `vendor.js`, `theme.js`.
Note: a script rewrites the Shopify dynamic checkout button text to **"Купете сега"** (Buy now).

### 0.7 PRICE RENDERING — CRITICAL DUAL-CURRENCY (`snippets/product-price.liquid` + `product-price-listing.liquid`)
Prices are NOT shopify `money`. They are rendered as **`{price} лв / {price×0.51} €`** using `money_without_currency`. Hardcoded EUR conversion ratio = **0.51**. The compare-at price (strikethrough) uses plain `money`. Fallback price when no variant = `1999` (i.e. 19.99). Example output: `49.90 лв / 25.45 €`.
- `.price` wrapper has modifier classes `price--sold-out`, `price--on-sale`, `price--unit-available`, `price--listing`, `price--compare-price-hidden`.
- Inner: `.price__pricing-group` → `.price__regular > .price-item--regular`, `.price__sale > .price-item--sale` + `<s class="price-item--regular">{compare}</s>`, `.price__badges` (`.price__badge--sale` / `--sold-out`), `.price__unit`.
- Same `лв / €` dual format also appears in cart line discounts (`cart-items.liquid`).

---

## 1. TEMPLATE SECTION ORDER (from `templates/*.json`)

### `index.json` (home) — section `order`:
1. **slideshow** (`1657285967afba02c0`) — 3 active image slides + 1 disabled. Full width, height `small`, mobile height `medium`, text large, autorotate 6s, dots+buttons. `custom_css` HIDES slideshow on mobile (`@media (max-width:750px){.slideshow{display:none}}`). Slides:
   - Slide 1 "**Nature3D**" / sub "Изключително качествен PLA на вече изключително достъпни цени" / btn "**Яко, заведи ме!**" → `/collections/nature3d`. img `3DPRINTING_wall-tiles_1920x1080`. overlay #000 @55%, text #fff, left center.
   - Slide 2 "**RE3D**" / "Точните консумативи за Вашия 3D принтер са вече налични в EasyTech3D" / btn "**Купете сега**" → `/collections/re3d`. img `baner_sait.jpg`. overlay @40%.
   - Slide 3 "**EasyTech3D**" / "Най-качествената 3D нишка за вашите най-смели проекти" / btn "**Всички колекции**" → `/collections`. img `baner_2.webp`. overlay @60%, left bottom.
2. **featured-products** (`1657285979c825b800`) — title "**Филаменти за 3D принтер**", subtitle "**Най-Популярни**", nav style `large`, grid 4. Tabs (blocks): "PLA Pro Филамент"(`pla-pro-filaments`), "PLA Филамент"(`pla-filaments`), "PETG Филамент"(`petg`). Carousel, dots+arrows, autoplay 4s.
3. **featured-products** (`427c0aa8...`) — title "**Филаменти за 3D принтер**", subtitle "**за истински ентусиасти**", nav style `normal`. Tabs: "PLA Flex"(`pla-flex`), "ABS"(`abs`), "ASA"(`asa`).
4. **featured-products** (`1657286047294e3104`) — title "**Резервни части за 3D принтери**", subtitle "**3д принтери**", nav `large`. Tabs: "Дюзи"(`nozzles`, limit 5), "Легла"(`3d-printer-beds`), "BL Тъчове"(`bl-touches`). autoplay 5s.
5. **collection-list** (`1657285989c345fe72`) — style `carousel`, title "**Всички Категории**", button "**Вижте категориите**" → `/collections`, grid 5, image_style `circle`. 7 collection blocks: nozzles, pla-flex, pla-pro-filaments, pla-filaments, petg, abs, asa.
6. **index-icons-with-text** (`16572860256a3e457c`) — title "**Защо да купувате от нас?**", subtitle "**от ентусиасти за ентусиасти**". 3 blocks (icons via `load-icon`):
   - `money-check` — "**Ниски Цени**" / "Целим се да направим 3Д принтирането по достъпно за българската общност"
   - `truck` — "**Бързи Доставки**" / "Поръчките се изпращат на същия ден, за да можете възможно най-скоро да се завърнете към проектите си"
   - `envelope` — "**Поддръжка**" / "Ако имате въпроси относно нашите продукти и използването им, свържете се с нас чрез формата за контакти с какъвто и да е въпрос."
7. slideshow (`1657286058...`) — **DISABLED**.
8. logo-bar (`165728609550d705f0`) — **DISABLED** (logos: nature3d, 3dline, piocreat, dimafix, re3d, elegoo).
9. **featured-blog** (`50be9603...`) — title "**Проверете нашият блог**", subtitle "**ако се интересувате от развития в принт светът**", blog handle `3д-принтове`, 4 posts, 4 per row, show author+date.
10. **newsletter** (`1657286107...`) — title "**Абонирайте се към нашият мейл лист**", subheading "Получавайте известия за промоции, нови продукти, евенти, развития в 3D принтинг светът и други", form labels shown.
11. apps (`1708955910...`) — webrex SEO breadcrumb app block.

### `collection.json`
`order: ["main"]` → **collection-template**. Settings: view `grid`, image mode `banner`, breadcrumbs on, overlay #000 @40%, grid 3, grid_mobile 1, rows 6, description `bottom`, sort disabled, layout `off_canvas_sidebar`, filters `none`, pagination `standart`.

### `product.json`
`order: ["main","product-recommendations","165728772697564e64"(newsletter, DISABLED)]`.
**product-template** blocks in `block_order`: `sku_block`, `product_title`, `rating`, `product_vendor`, `product_price`, `product_options_block` (swatches on, variant image swatches), `quantity_block`, `product_buttons` (payment button on), `back_in_stock`, `product_description` (full_width). Settings: breadcrumbs on, mobile sticky buttons on, media size `medium`, image zoom on, video looping, thumbnails `grid` size 4. **product-recommendations**: heading "You may also like", grid_mobile 2.

### `cart.json`
`order: ["main"]` → **cart-template**. overlay #000 @40%, breadcrumbs on, shipping estimator on, default country `Bulgaria`.

### `blog.json`
`order: ["main"]` → **blog-template**. blocks: `search` (form on), `links` (menu). Settings: overlay #000 @40%, layout `grid`, breadcrumbs off, tags dropdown on, show date, show excerpt, pagination `standart`.

### `article.json`
`order: ["main"]` → **article-template**. use_featured_image on, breadcrumbs off, overlay #000 @40%, show date+author+tags+share buttons.

### `search.json`
`order: ["main"]` → **search-page** (no settings).

### `list-collections.json`
`order: ["main"]` → **list-collections-template**. overlay #000 @40%, title "**Колекции**", breadcrumbs on, display `full_image`, image height 300, display_type `all`, sort `products_high`, grid 3, grid_mobile 1.

### `page.contact.json`
`order: ["main","16572891308791841f"(index-icons-with-text, DISABLED),"1657289136..."(slideshow, DISABLED),"16572891445ca8e851"(page-contact)]`.
- **main** = main-page (overlay #000 @41%, breadcrumbs on, show page content).
- **page-contact** (`16572891445ca8e851`) — title "**Свържете се с нас**", subtitle "**Пратете ни мейл**", subheading "Въпроси по мейла". `custom_css` hides the phone field.

### `page.json` (generic)
`order: ["main"]` → main-page. overlay #000 @40%, breadcrumbs off, show content.

### `404.json`
`order: ["main"]` → main-404 (all settings blank → uses locale defaults).

---

## 2. SECTIONS (purpose · DOM skeleton w/ EXACT classes · data · template)

> Section markers: each section root carries `data-section-type="..."` and `id="section-{id}"` or `data-section-id`. Schema `class` adds `index-section` wrappers.

### 2.1 `header.liquid` → `data-section-type="header-section"` (rendered by `theme.liquid`)
Purpose: top nav, logo, search, cart, account, mega menus, mobile nav.
**Active config**: `align_logo="inline"`, logo `logo.jpg` w100, main_linklist style `uppercase`, locale selector on, currency off, live search on, search filter on, popular products collection `pla-flex`. `custom_css` rounds the logo img + tweaks nav.
Top-level skeleton:
```
<div data-header-section><header class="site-header logo--{align} {enable_emphasize_category_menu?}" role="banner">
  <div class="header_top__row | header_top grid grid--no-gutters">     ← top utility row
     [align=left only] <div class="header_top_navigation_wrapper">...top_navigation_links / customer + selectors...</div>
     <div class="header_top__wrapper | grid__item medium-up--…">
        <div class="logo_element-wrapper"><div class="logo_element"><h1|div class="h4 site-header__logo"><a class="site-header__logo-image"><img class="js main_logo"></a></div></div></div>
        <div class="site-header__icons"><div class="site-header__icons-wrapper">{{search_bar}}{{header_cart_icon}}<button class="js-mobile-nav-toggle mobile-nav--open">hamburger/close</button></div></div>
     </div>
     <ul class="top_navigation_links right_column"> ← customer_nav (login dropdown) + localization selectors </ul>
  </div>
  <div class="grid grid--no-gutters site-header__mobile-nav">          ← main nav row
     <div class="logo_element-wrapper | mobile-logo-element-wrapper">{{logo}}</div>
     <nav id="AccessibleNav" role="navigation"><div class="navigation_wrapper">
        [optional categories_linklist menu]
        <ul class="nav-bar__linklist list--unstyled main_nav-bar_linklist" data-type="menu">
           <li class="nav-bar__item {item-has-mega-menu?} {mega_menu_main_parent?}">
              <a class="nav-bar__link link"><span>{title}</span>{arrow-bottom}{nav-triangle}</a>
              {%- render 'desktop-menu' -%}     ← dropdown / mega-menu
           </li>
        </ul>
     </div></nav>
     <div class="site-header__icons"><div class="site-header__icons-wrapper">{{search_bar}}{{header_cart_icon}}{hamburger}</div></div>
  </div>
  <nav class="mobile-nav-wrapper medium-up--hide critical-hidden"><ul id="MobileNav" class="mobile-nav">
     <li class="mobile-nav__item"><button class="js-toggle-submenu mobile-nav__link"><span class="mobile-nav__label"></span><div class="mobile-nav__icon">{chevron-right}</div></button>
        <ul class="mobile-nav__dropdown" data-parent data-level="2">…recursive return-btn pattern…</ul></li>
     ...
  </ul>
  <div class="mobile-nav-footer"><div class="mobile-nav-footer-block">…account, selectors, email, phone…</div></div></nav>
</header></div>
```
- **search_bar** capture: `.search-bar__interior` → `button.header-search-button` (icon-search) + `.search-form__container` → optional `.search_categories_menu` (All Categories dropdown, locale key `sections.header.all_categories`="Всички Категории") + `<form class="search-form search-bar__form" action="{search_url}">` → `.search-form__input-wrapper > input.search-form__input.search-bar__input` placeholder "Търсене" + `.predictive-search-wrapper > .predictive-search` (popular searches "Популярни търсения" + `.search-bar__results` + popular products "Популярни продукти" → `ul#predictive-search-results.predictive-search__list > li.predictive-search-item`) + `button.search-form__submit`.
- **header_cart_icon** capture: `.header_cart_info.btn.btn--primary#HeaderCart[data-cart-count-bubble]` → optional `.cart_total_info` (label "Всичко общо:" + `.cart_total_price.h6`) + `<a class="cart_icon btn btn--primary" href="{cart_url}">{cart icon}<span class="header_cart_count" data-cart-count>{count}</span></a>`.
- **logo_element**: on home wraps in `<h1>`, else `<div>`, class `h4 site-header__logo`.
- Customer dropdown: `.customer_nav_dropdown__wrapper` button `.customer_nav_button` (login icon + "Моят Акаунт") + `.customer_nav_dropdown` ul.
- Localization: `{%- form 'localization' -%}` → `.selectors-form__item > .disclosure[data-disclosure-currency|locale] > button.disclosure__toggle + ul.disclosure-list > li.disclosure-list__item > a.disclosure-list__option`.
- Header schema blocks: `mega_menu` (menu_item + image_1/2 w/ heading/text/link), `category_menu` (menu_item + image/heading/link).
- JS sets `--header-height` CSS var on load/resize.

### 2.2 `announcement-bar.liquid` → `data-section-type="announcement-bar"` (in `theme.liquid`)
Purpose: rotating promo bar (Flickity). **Active**: bg `#fd5b2a`, text `#fff`, no close button, arrows on, autoplay 4s. Blocks (richtext, may be wrapped in `<a>` if link):
- "**Безплатна** доставка за поръчки над **150лв**!"
- "**EasyTech3d** - ***Партньор във Вашия Творчески Свят***"
Skeleton:
```
<section id="section-{id}" data-section-type="announcement-bar">
  <div class="AnnouncementBar"><div class="AnnouncementBar__Wrapper">
     <div class="AnnouncementBar__Slider" data-flickity-config>
        <div class="AnnouncementBar__Content">{a|content}</div> ...
     </div></div>
     [optional] <a class="AnnouncementBar__close_button">{icon-close}</a>
  </div>
</section>
```
Sets `--announcement-bar-height` CSS var.

### 2.3 `footer.liquid` → `data-section-type="footer-section"`
Purpose: footer with call-to-action blocks, link lists, text/social, newsletter, copyright, payment icons.
**Active blocks (order)**: 4 call_to_action (all DISABLED), text "**Последвайте ни**" (social icons on), link_list (disabled dupe), link_list "**Бързи Линкове**" (menu `footer`), newsletter (disabled), text "**all rights reserved @ easytech3d**". `custom_css` makes footer a centered 12px flex row. footer_bg opacity 20.
Skeleton:
```
<footer class="site-footer critical-hidden" data-section-type="footer-section">
  [optional <img class="footer_bg">]
  <div class="site-footer-wrapper"><div class="page-width">
     [if any call_to_action] <div class="call-to-action"><div class="call-to-action__block"><div class="image">{load-icon|img.custom_icon}</div><div class="content"><span class="h6">{heading}</span>{content}</div></div>…</div>
     <div class="site-footer__content">
        <div class="site-footer__item {footer_item width class}"><div class="site-footer__item-inner site-footer__item-inner--{type}">
           <p class="h5">{title}</p>
           — newsletter: .site-footer__rte + .site-footer__newsletter > form('customer') > .input-group > input.newsletter__input + span.input-group__btn > button.btn.btn--primary.newsletter__submit ({check} icon)
           — text: .site-footer__rte + optional localization selectors + ul.site-footer__social-icons.social-icons > li.social-icons__item.btn.btn--primary > a.social-icons__link
           — link_list: ul.site-footer__linklist > li.site-footer__linklist-item > a
        </div></div> ...
     </div>
  </div></div>
  <div class="site-footer__bottom_content"><div class="page-width"><div class="grid grid--footer-float-left mobile-reverse">
     [copyright] <small class="site-footer__copyright-content">© {year}, {shop.name link}</small>
     [payment] <div class="site-footer__payment-icons"><ul class="payment-icons">...</ul></div>
  </div></div></div>
</footer>
```
Footer width helpers computed by block count: 1→`--full-width`, 2→`--one-half`, 3→`--one-third` (or `--one-quarter` if a newsletter block), 4→`--one-quarter`, 5→`--one-fifth`.

### 2.4 `slideshow.liquid` → `data-section-type="slideshow-section"` (schema class `index-section--slideshow index-section--flush`)
Purpose: hero image/video slider (Flickity). Blocks `image` | `video`.
Skeleton:
```
<div data-section-type="slideshow-section" class="fade-in-animation">
 <div class="slideshow-section-wrapper {page-width if width=wrapper}">
  <div id="SlideshowWrapper-{id}" class="slideshow-wrapper" data-slider>
   <div id="Slideshow-{id}" class="slideshow slideshow--{height} mobile-slideshow--{mobileHeight}" data-slider-container data-autorotate data-speed>
    <div id="slickSlide-{blockId}" class="slideshow__slide slideshow__slide--{id} {slideshow__slide--active on first} block_type__{type}" data-slider-slide-index>
       [video] .video-section-wrapper.video-background-wrapper > .slideshow__overlay.video__overlay + (youtube .video--background | <video class="slideshow_video">)
       [image] .slideshow__image_wrapper > img.slideshow__image.box (responsive srcset 375..2800) + .slideshow__overlay#slideshow__overlay_{id}
       <div class="slideshow__text-wrap slideshow__text-wrap--desktop"><div class="slideshow__text-content slideshow__text-content--vertical-{v} text-{h}"><div class="page-width-small">
          <ul class="slideshow__text-content-list">
             <li><h2 class="h1 mega-title slideshow__title {mega-title--large if text large}">{slide_title}</h2></li>
             <li><span class="mega-subtitle slideshow__subtitle {mega-subtitle--large}">{subheading}</span></li>
          </ul>
          <div class="slideshow__btn-wrapper slideshow__btn-wrapper--push"><a class="btn slideshow__btn btn--{style}"><span>{label}</span>{tail-right}</a> [btn2]</div>
       </div></div></div>
    </div> ...
   </div>
   <div class="slideshow__controls page-width-small {arrows_only?}">
      <ul class="slick-dots" data-slider-indicators><li class="slick-active" data-slider-indicator><a data-slide-number></a></li>...</ul>
      <div class="slideshow__arrows"><button class="slideshow__arrow slideshow__arrow-previous btn btn--circle-arrow">{tail-left}</button><button class="slideshow__arrow slideshow__arrow-next btn btn--circle-arrow" data-slider-button-next>{tail-right}</button></div>
   </div>
  </div>
 </div>
</div>
```
Overlay opacity/color injected per-block via inline `<style>`. Heights: `small`/`medium`/`large`/`adapt` (adapt uses image aspect ratio `:before` padding). Text alignment is 9-way ("left center", "left bottom" etc.). Button styles: primary/secondary/white/transparent_primary/transparent_secondary.

### 2.5 `featured-products.liquid` → `data-section-type="featured-products"` (schema class `index-section section_with_bg`, max 3 blocks)
Purpose: tabbed collection product carousel. Blocks = `collection` (heading + collection_handle + max_products_count).
Skeleton:
```
<section id="section-{id}" data-section-type="featured-products">
 <div class="index-tabs-collections-wrapper section_main_content {half_row_mobile?}">
   <div class="section-header page-width homepage_subtitle_style_{match_header}">
      <span class="h5">{subtitle}</span>
      <h2>{title}</h2>
      <div class="index-tabs_nav__wrapper navigation_style_{large|normal}">
         <div class="index-tabs_nav">
            <a class="index-tabs_nav--item {active on first}" data-index data-href="tab_{handle}_{blockId}"><h3|h2>{heading}</h3></a> ...
         </div>
         [carousel] <div class="slider_custom_arrows"><a id="button_prev_{id}" class="button-prev btn btn--circle-arrow">{tail-left}</a><a id="button_next_{id}" class="button-next btn btn--circle-arrow">{tail-right}</a></div>
      </div>
   </div>
   <div class="section-tabs-content {use_align_height|use_image_height} {page-width if no carousel}">
      <div class="index-tabs-content_block {active on first}" id="tab_{handle}_{blockId}">
         [carousel] <div class="index-tabs-content_block__slider slides_{n}" data-flickity-config>{product-card-item ×N}</div>
         [grid]     <div class="grid grid--uniform grid--view-items">{product-card-item ×N}</div>
      </div> ...
   </div>
 </div>
 [optional bg] <div class="section_bg"><img class="section_bg_image"></div>
</section>
```
Each product rendered via `{% include 'product-card-item' %}` (see §4.1). nav_style `large` uses `<h2>/<h3>` headings; `normal` uses `<h3>`. Grid 2→max_height 530, 3→345, 4→250, 5→195.

### 2.6 `collection-list.liquid` → `data-section-type="collection-list"` (schema class `index-section bg_image_with_custom_content collection-list-section`)
Purpose: collection cards. 3 styles: `carousel` (active on home), `grid`, `split_screen`. Blocks = `featured_collection` (collection + optional image).
**Carousel skeleton** (home uses this):
```
<section id="section-{id}" data-section-type="collection-list" class="fade-in-animation section_style_carousel image_style_circle">
  [bg] <div class="section_bg"><img class="section_bg_image"></div>
  <div class="section_content carousel_section_content {without_image?}"><div class="page-width">
     <div class="section-header homepage_subtitle_style_{match_header}">
        <div class="section-header-content"><span class="h5">{subtitle}</span><h2 class="mega-title--large">{title}</h2><a class="btn collection-list__btn btn--{style}"><span>{button_text}</span>{tail-right}</a></div>
        <div class="slider_custom_arrows">{prev/next circle-arrow buttons}</div>
     </div>
     <div class="collection-list__slider grid grid--uniform" data-flickity-config>
        <div class="collection-list__slide grid__item {grid_item_width}">{% include 'collection-grid-item' %}</div> ...
     </div>
  </div></div>
</section>
```
- `grid` style: `.page-width-small.grid-type` > `.section-header.text-center` > `.collection-list-grid` > `ul.grid.grid--uniform > li.grid__item` each `collection-grid-item`, + bottom `.collection-list-btn-wrapper`.
- `split_screen` style: `.section_content` > `.page-width-small.split_screen__type.content_side_{left|right}` with inline `.collection-grid-item` markup + `.section_overlay` divs.
- image_style options: `circle` / `square` / `background`. Grid 2–6 → fraction widths.

### 2.7 `index-icons-with-text.liquid` → `data-section-type="index-icons-with-text"` (schema class `index-section`)
Purpose: 3-up value props (icon + title + richtext). Blocks = `block` (custom_icon | image, title, content, link).
Skeleton:
```
<section id="section-{id}" data-section-type="index-icons-with-text">
 <div class="page-width-small">
   <header class="section-header text-center homepage_subtitle_style_{match_header}"><span class="h5">{subtitle}</span><h2>{title}</h2></header>
   <div class="icon-with-text--blocks">
      <div class="icon-with-text--block zoom-fade-animation-element-wrapper">
         [a.icon-with-text--block_link if link]
         <div class="block_icon"><img class="zoom-fade-animation-element">|<span><load-icon name="{custom_icon}"></load-icon></span></div>
         <div class="block_info"><span class="h4">{title}</span><div class="block_content">{content}</div></div>
      </div> ...
   </div>
 </div>
</section>
```
Icon color via inline `<style> .block_icon svg { color: {icon_color || color_button} }`.

### 2.8 `featured-blog.liquid` → `data-section-type="featured-blog"` (schema class `index-section featured-blog-section`)
Purpose: blog post grid/carousel. Pulls `blogs[settings.blog]`.
Skeleton:
```
<section id="section-{id}" data-section-type="featured-blog">
 <div class="page-width">
   <header class="section-header text-center homepage_subtitle_style_{match_header}"><span class="h5">{subtitle}</span><h2>{title}</h2>[slider_custom_arrows]</header>
   [carousel] <div class="featured-blog__slider" data-flickity-config>
      <div class="featured-blog__slide {grid_item_width}"><article class="article_block">
         <a class="article__link"><div class="article__grid-image-wrapper js"><div class="article__grid-image-container"><img class="article__grid-image zoom-fade-animation-element">{load_spinner}</div></div></a>
         <div class="article_block_info">
            <span class="article__author {text_name?}">{logo img | "от {author}"}</span>
            <a class="h4 article__title">{title}</a>
            <div class="article__grid-meta"><span class="article__date">{date}</span><div class="article__comment_info"><a class="article__comment-count"></a></div></div>
         </div>
      </article></div> ...
   </div>
   [grid] <ul class="grid grid--uniform grid--blog"><li class="grid__item {grid_item_width}">{same article_block}</li>...</ul>
   [view-all] <div class="text-center"><a class="btn btn--{style}"><span>{button_text}</span>{tail-right}</a></div>
 </div>
</section>
```
Author resolution: matches `article.author` against settings `author_name_1..3` to swap in a custom `author_logo`. Default author text "от {author}". Comments label "{n} коментар(и)".

### 2.9 `newsletter.liquid` → schema class `index-section index-section--flush index-newsletter`
Purpose: email capture. **Active home**: title "Абонирайте се към нашият мейл лист", form labels on.
Skeleton:
```
<section id="section-{id}" class="fade-in-animation">
 <div class="newsletter-section"><div class="page-width-small">
   <div class="section-header text-center homepage_subtitle_style_{match_header}"><span class="h5">{subtitle}</span><h2 class="h2">{section_title}</h2><div class="rte">{subheading}</div></div>
   {% form 'customer' class:'contact-form form-single-field' %}
      [success] <p class="form-message form-message--success">{confirmation}</p>
      [error] <span class="input-error-message">{icon-error}{msg}</span>
      <input type="hidden" name="contact[tags]" value="newsletter">
      [if showFormLabels] <div class="grid grid--half-gutters"><div class="grid__item medium-up--one-half"><input class="Form__Input input-group__field" name="contact[first_name]" placeholder="Първо име"></div><div ...><input name="contact[last_name]" placeholder="Фамилно име"></div></div>
      <div class="input-group"><input type="email" class="Form__Input input-group__field" name="contact[email]" placeholder="Имейл"></div>
      <span class="input-group__btn-wrapper"><button class="btn btn--{style}"><span>Подай</span>{tail-right}</button></span>
   {% endform %}
 </div></div>
 [bg image] <div class="section_bg"><img class="section_bg_image"></div>
</section>
```

### 2.10 `collection-template.liquid` → `data-section-type="collection-template"`
Purpose: collection grid/list with off-canvas sidebar + banner header. Loads `collection-page.css`.
Skeleton:
```
<div data-section-type="collection-template" data-pagination_mode="{standart}">
 <header class="collection-header">
   [banner mode] {% render 'custom_page_header' ... show_collection_filters_toolbar:true %}   ← img header w/ H1 + breadcrumbs + filters toolbar
   <div class="page-width">
     [no-banner] <div class="section-header">{breadcrumbs}<div class="section-header-wrapper"><div class="section-header-wrapper-collection"><h1 class="h2">{collection.title}</h1><span class="filters-toolbar__product-count">{N продукти}</span></div>
        <div class="filters-toolbar"><button class="open_mobile_sidebar btn btn--primary"><span>Филтър</span></button><button class="collection__layout-button is-selected" data-layout-mode="grid">{grid icon}</button><button class="collection__layout-button" data-layout-mode="list">{list icon}</button>[sort: .toolbar_sort_by-block > select#SortBy]</div></div></div>
     [image mode] <div class="collection-image-container"><img class="collection-image"></div>
   </div>
 </header>
 <div class="page-width">
   [desc top] <div class="collection-description rte">{collection.description}</div>
   <div class="Collection_Section filters_view_mode_{off_canvas_sidebar}">
      {% include 'collection-sidebar' %}      ← off-canvas filters (skipped if no_sidebar)
      <div id="Collection">
         <div id="AjaxinateContainer?" class="CollectionGrid">
            <div class="{enable_list_mode?} grid use_align_height|use_image_height Collection-wrapper grid--uniform grid--view-items">
               {% include 'product-card-item' ×N %}     (list:show_as_list)
               [empty 'all' collection] onboarding placeholder cards with $19.99
            </div>
         </div>
         {pagination}
      </div>
   </div>
   [desc bottom — active] {collection.description}
 </div>
</div>
```
`{% paginate collection.products by limit %}` where limit = grid×rows (grid mode) or 16 (list). Grid sets max_height (2→530…5→195). Sort label "Сортирай:". Item count "N продукти". `collections.general.collection_label`="Колекция", grid="Мрежа", list="Лист".

### 2.11 `product-template.liquid` → `data-section-type="product"` (`#ProductSection-{id}`)
Purpose: PDP — media gallery + meta/form built from blocks. Loads `component-rating.css`, conditionally photoswipe.
Top skeleton:
```
<div class="page-width-small" id="ProductSection-{id}" data-section-type="product" data-enable-history-state data-enable_linked_options data-show_preOrder_btn data-show_pick_an_option>
  [breadcrumbs]
  <div class="grid product-single {product-single--{mediaSize}-media if payment btn}">
    <div class="grid__item product-single__media-group {product_media_width}">
       <div class="product-single__media__carousel {product_image__zoom}" data-product-main-slider data-flickity-config>
          <div class="product-single__media__slide" data-media-id data-media-index>{% include 'media' %}</div> ...
       </div>
       [3d] <button class="product-single__view-in-space" data-shopify-xr>{3d-badge}<span class="product-single__view-in-space-text">Преглед във вашето пространство</span></button>
       {% include 'thumbnails-gallery' %}
    </div>
    <div class="grid__item {product_description_width}">
       <div class="product-single__meta">
          {% form 'product' class:'product-form product-form-{id} ...' %}
             ... blocks rendered by {% case block.type %} ...
          {% endform %}
       </div>
    </div>
  </div>
</div>
```
**Block → markup map** (`block_order`: sku_block, product_title, rating, product_vendor, product_price, product_options_block, quantity_block, product_buttons, back_in_stock, product_description):
- `product_title` → `<h1 class="product-single__title h3">{title}</h1>`
- `rating` → `.rating[role=img] > .rating-star.color-icon-text[style=--rating]` + `.rating-text.caption` + `.rating-count.caption` (uses `product.metafields.reviews.rating`).
- `product_vendor` → `.price__vendor > .visually-hidden("Доставчик") + {vendor link}`
- `product_price` → `.product__price` wraps `{% include 'product-price' %}` (dual лв/€) + optional `.product__policies.rte` (taxes/shipping).
- `product_options_block` → `.product-form__controls-group.product_options_block_wrapper` > per option `.selector-wrapper.product-form__item > label.header + select.single-option-selector.product-form__input` (+ swatches when enabled).
- `quantity_block` → `.form_bg_row.quantity_block > .product_quantity_info_container > .qty_container > label.header("Количество:") + .qty.product-page-qty > a.minus_btn.qty_btn + input.product-form__input--quantity[value=1] + a.plus_btn.qty_btn`.
- `product_buttons` → `.product-form__controls-group.product-form__controls-group--submit {product-form-sticky-parent if mobile sticky}` > `.product-form__item--submit {--payment-button}` > `<button class="btn product-form__cart-submit btn--primary" data-add-to-cart><span data-add-to-cart-text>{Добави в количката|Изпродадено|Предварителна поръчка}</span>{cart icon}<span data-loader>{spinner}</span></button>` + optional `{{ form | payment_button }}` + `.pre_order_text` + `.product-form__error-message-wrapper`.
- `product_description` (full_width) → sets flag; rendered full-width below (`.rte.product-single__description`).
- `inventory_qty` → `.inventory_qty_info > .product-form__inventory` (box load-icon + status icon + `.product-form__inventory-text.h6` text "На склад…"/"Изчерпано количество").
- `show_share_buttons` → `{% include 'social-sharing' %}`.
- `complementary` → complementary-products slider.
Media size map: small→media `one-third`/desc `two-thirds` h345; medium→`one-half`/`one-half` h530; large→`two-thirds`/`one-third` h720; full→`''` h1090.

### 2.12 `cart-template.liquid` → `data-section-type="cart-template"`
Purpose: full cart page. Loads `cart-page.css`. Drawer is separate (`cart-drawer.liquid`).
Skeleton:
```
<div>
  [banner] {% render 'custom_page_header' heading:"Количка" %}
  <div class="page-width" data-section-type="cart-template" data-section-settings='{type,itemCount,totalPrice,drawer,hasShippingEstimator}'>
    <div class="PageContent {hide if empty}">
      <form action="{cart_url}" method="post" class="Cart">
        <div class="Cart_ContentSide">
           {% render 'cart-items' %}            ← Cart__ItemList (see §4.4)
           <div class="cart__footer"><div class="grid">
              [notes] .grid__item.medium-up--one-half > .cart__block > .cart_block__title.h6("Допълнително Съобщение") + textarea.cart-note__input + button.CartSpecialInstructionsSubmit.btn.btn-gray("Добави съобщение")
              [shipping est] .cart__block > .cart_block__title.h6("Оценка на доставката") + .ShippingEstimator__Form (country select / city / province / zip inputs) + button.ShippingEstimator__Submit("Калкулиране на доставка")
           </div></div>
        </div>
        <div class="Cart_SidebarSide"><div class="cart__block">
           <div class="cart_block__title h6">Общо в количката</div>
           <div class="cart-subtotal h6"><span class="cart-subtotal__title">общо</span><span class="cart-subtotal__price" data-cart-subtotal>{money}</span></div>
           [discounts] .order-discount-card-wrapper ...
           ...checkout button, free-shipping bar (threshold 105)...
        </div></div>
      </form>
    </div>
    [empty cart state when item_count==0 — "Количката е празна. ;("]
  </div>
</div>
```
Shipping estimator default country `Bulgaria`. Cart head labels (page only): Продукти / Цена / Количество / Тотално.

### 2.13 `blog-template.liquid` → `data-section-type="blog-page"`
`{% render 'custom_page_header' %}` (header image + H1 = blog title + optional breadcrumbs). Then:
```
<section data-section-type="blog-page" data-pagination_mode><div class="page-width">
  <div class="blog_page_top_bar"><button class="open_mobile_sidebar btn btn--primary"><span>Филтър</span></button>
     <div class="blog_page_top_bar-dropdowns-wrapper">
        <div class="blog_page_top_bar-dropdown-wrapper blog_page_top_bar_menu"><select#top_bar_menu>{menu links}</select>{chevron-down}</div>
        <div class="...blog_page_top_bar_tags"><select#top_bar_tags><option>Етикети</option>{tags}</select>{chevron-down}</div>
     </div>
  </div>
  ... grid of article cards (grid layout: mobile--one-whole small--one-half medium-up--one-third) + sidebar + pagination ...
</div></section>
```
`{% paginate blog.articles by 12 %}`. Layout `grid` → 3 per row.

### 2.14 `article-template.liquid` → `data-section-type="article-page"`
`{% render 'custom_page_header' blog_show_author blog_show_date image:article.image %}` when featured image used. Then:
```
<section data-section-type="article-page"><article class="page-width-small article-page {show_full_rte if no share}">
  [no header image] <div class="section-header text-left section-header_without_image"><h1 class="article__title h2">{title}</h1>{breadcrumbs}<div class="article_header_meta-info"><div class="article__grid-meta"><span class="article__date">{date}</span>...</div>{% render 'article_author_block' %}</div></div>
  [inline image] <div class="article_image_block"><div class="article-image-wrapper"><div class="article-image-container"><img class="article-image"></div></div></div>
  ... article.content (rte), tags, share buttons (social-sharing), comments ...
</article></section>
```

### 2.15 `main-page.liquid` → generic page
```
{% render 'custom_page_header' image:header_image heading:page.title show_heading:true %}
[if show_page_content] <div class="page-width"><div class="grid"><div class="grid__item medium-up--five-sixths medium-up--push-one-twelfth"><div class="rte">{page.content}</div></div></div></div>
```

### 2.16 `page-contact.liquid` → contact form section
```
<section id="section-{id}"><div class="page-width"><div class="grid"><div class="grid__item medium-up--five-sixths medium-up--push-one-twelfth">
  <div class="section-header text-center homepage_subtitle_style_{match_header}"><span class="h5">{subtitle "Пратете ни мейл"}</span><h2 class="h2">{section_title "Свържете се с нас"}</h2><div class="rte">{subheading}</div></div>
  <div class="contact-form form-vertical">{% form 'contact' id:'ContactForm' %}
     {% include 'form-status' %}
     <div class="grid grid--half-gutters">
        <div class="grid__item medium-up--one-half"><label for="ContactForm-name">Име *</label><input id="ContactForm-name" name="contact[Име]" required></div>
        <div class="grid__item medium-up--one-half"><label for="ContactForm-email">Имейл *</label><input type="email" id="ContactForm-email" name="contact[email]" required></div>
     </div>
     <label for="ContactForm-phone">Телефонен Номер</label><input type="tel" id="ContactForm-phone" name="contact[Телефонен Номер]">   ← HIDDEN via custom_css on this page
     [custom blocks: label + input/textarea]
     <label for="ContactForm-message">Съобщение *</label><textarea id="ContactForm-message" name="contact[Съобщение]" required></textarea>
     <button class="btn btn--{style}"><span>Прати</span>{tail-right}</button>
  {% endform %}</div>
</div></div></div>
[bg image] <div class="section_bg"><img class="section_bg_image"></div>
</section>
```

### 2.17 `main-404.liquid`
```
<div class="page-width-small"><div class="empty-page-content text-left page-404-content">
  <h3>Страницата не е намерена ;(</h3>
  <h1 class="mega-title--large mega-title">Страница 404 </h1>
  {text "<p>The page you are looking for does not exist.</p>" default}
  <div class="btn_wrapper">
     <a class="btn btn--primary" href="{root}"><span>Обратно в началото</span></a>
     <a class="btn btn--transparent_secondary" href="{root}"><span>Свържете се с нас!</span></a>
  </div>
  <div class="page-404-footer"><small class="site-footer__copyright-content">© {year}, {shop.name}</small></div>
</div></div>
```

### 2.18 `search-page.liquid` → `data-section-type="search-template"`
Loads `collection-page.css`. Header via `custom_page_header` (title = "Потърсете в нашия сайт" or "{count} резултати за “{terms}”"). Then:
```
<div data-section-type="search-template" data-pagination_mode><div class="page-width">
  <div class="Search_Section filters_view_mode_{...} {EmptySearch_Section if 0}">
     {% include 'search-sidebar' %}
     <div class="search-page-wrapper">
        [no header img] <div class="text-center"><h1 class="h2">{title}</h1></div>
        <div class="grid"><div class="grid__item medium-up--six-tenths medium-up--push-two-tenths">
           [no results] <div class="rte search--no-results-found text-center"><p>Няма резултати. Пробвайте да промените ключовите думи</p></div>
           <form action="{search_url}" class="search-form search-page-form"><div class="input-group input-group--nowrap"><div class="input-group__field search-form__input-wrapper"><input class="search-form__input" name="q" placeholder="Търсене"></div></div></form>
           ... results grid ...
        </div></div>
     </div>
  </div>
</div></div>
```
`{% paginate search.results by 10 %}`. `searchMode` = `product`.

### 2.19 `list-collections-template.liquid` → renders all collections grid
Header via `custom_page_header` (title "Колекции"). Uses `collection-grid-item` / `collections-grid-item` with product count + "Разгледай" button. grid 3.

### 2.20 Other sections (present, mostly unused on this store but available)
`advanced-search`, `apps` (app blocks / breadcrumb), `brands-section`, `custom-liquid`, `faq-section`, `feature-row`, `featured-blocks`, `featured-product`, `gift_card__section`, `index-accordion`, `index-countdown-timer`, `index-custom-section`, `index-page`, `logo-bar` (`data-section-type="logo-bar"`, `.logo-bar--slider` Flickity), `map`, `mosaic`, `password-content/header/footer`, `pickystory-products`, `product-recommendations` (`data-section-type` heading "You may also like"), `quotes`, `rich-text`, `shop-the-look`, `store-availability`, `timeline`, `video`.

---

## 3. NAVIGATION SNIPPETS

### 3.1 `desktop-menu.liquid`
Dispatched per top-level link from header. If link matches a `mega_menu` block → renders `mega-menu`; else builds nested dropdowns:
```
<ul id="dropdown-{index}" class="nav-dropdown {nav-dropdown--floating|--restrict}" data-type="menu" aria-hidden="true">
  <li class="nav-dropdown__item {has-mega-menu?}">
     <a class="nav-dropdown__link link"><span>{title}</span>{chevron-right if children}</a>
     <ul id="sub_dropdown-{n}" class="nav-dropdown">… 3 levels deep …</ul>
  </li>
</ul>
```

### 3.2 `mega-menu.liquid`
```
<div id="dropdown-{index}" class="mega-menu" data-type="menu" aria-hidden="true">
  <div class="mega-menu__inner {--left|--center|--large}">
     <div class="mega_menu_columns__wrapper">
        <div class="mega-menu__column"><span class="mega-menu__title heading">{link.title}</span>
           <ul class="mega-menu__linklist"><li class="mega-menu__item"><a class="mega-menu__link link"><span>{sub}</span></a></li>...</ul>
        </div> ...
     </div>
     [image_1/2] <a class="mega-menu__promo"><div class="mega-menu__image-wrapper"><div class="aspect-ratio"><img class="image--blur-up"></div></div><span class="mega-menu__image-heading heading h4">{heading}</span><p class="mega-menu__image-text">{text}</p></a>
  </div>
</div>
```
Wrapped in `.page-width` unless condensed layout.

### 3.3 `categories-menu.liquid`
Emphasized category mega-dropdown (only when `categories_linklist` set — NOT set on this store). Structure: `ul.first_lvl.nav-dropdown.categories-nav-dropdown` → `li.nav-dropdown__item.has-mega-menu` → `.second_lvl.categories-nav-dropdown.nav-dropdown` (+ `.nav-has-menu_image` w/ `.nav-dropdown-image-block > img.menu_block-image` + `.menu_block-image_heading`) → `.third_lvl.nav-dropdown`.

### 3.4 `site-nav.liquid`
Generic site-nav variant snippet (not the primary path here — header uses `nav-bar__linklist` + `desktop-menu`).

---

## 4. PRODUCT / COLLECTION CARD SNIPPETS

### 4.1 `product-card-item.liquid` (the core product card — used by featured-products, collection, search)
Accepts: `product`, `list` (bool grid/list mode), `max_height`, `show_vendor`, `products_per_row`, plus complementary/quick-add flags.
Top skeleton:
```
<div class="zoom-fade-animation-element-wrapper grid__item product-item-block {view-mode-list|view-mode-grid} {grid_item_width} {grid_item_mobile_width} {product-item-block--withAlternateImage?}">
  {% include 'image-style' %}
  <div class="product-card product-card-wrapper {item--sold-out?}">
     [labels] <div class="product-item__label-list"><span class="product-label product-label--custom1|--custom2|--on-sale|--soldout">…</span></div>
     <div class="product-item--media">
        <div class="product-card__image-with-placeholder-wrapper">
           <a class="list-view-item__link-image product-card__link-image" href="{product.url}">
              <div class="list-view-item__image-wrapper product-card__image-wrapper js">
                 <img class="list-view-item__image product-card__image zoom-fade-animation-element" data-image>   ← primary
                 [hover] <img class="item__image product-card__image product-card__image--alternate">           ← second media (show_second_image_on_hover ON)
                 {% render 'load_spinner' %}
              </div>
           </a>
        </div>
        [swatches] <div class="product-item__swatches"><div class="color-swatch-list"><div class="color-swatch"><input class="color-swatch__radio"><label class="color-swatch__item"><a class="color-swatch__item-link">+N</a></div>…</div></div>
     </div>
     <div class="product-item--info">
        [vendor] <a class="product-item__vendor link">{vendor}</a>
        <a class="item__link-title product-card__link-title" href="{product.url}"><span class="h4 item__title product-card__title">{title}</span></a>
        <div class="product-item__price_and_reviews_row">
           {% include 'product-price-listing' %}     ← dual лв/€ price
           [reviews] <a class="product-item__reviews-badge link"> .rating > .rating-star + .rating-text + .rating-count </a>
        </div>
        [desc] <div class="product-item__desc rte">{truncated description}</div>
        {product-item-form}      ← quick-buy / add-to-cart / choose-options + quick-view button
     </div>
  </div>
</div>
```
**product-item-form** (when `show_add_to_cart`): `{% form 'product' class:'product-item__action-list ... button-stack with_quickview_btn' %}` → `<button class="btn product-form__cart-submit btn--primary"><span data-add-to-cart-text>Добави в количката|Опции|Изкупено</span>{cart icon}</button>`. Quick view (enabled): `<button class="btn btn--primary open-quick-view--btn" data-product-url><span>Бърз преглед</span>{tail-right}</button>`.
Color swatch detection: option names matched against `color,colour,couleur,colore,farbe,색,色,カラー,färg,farve`. Swatch limit 5 then `color-swatch--view-more`.
Product labels from tags `__label:`/`__label1:`/`__label2:`; sale label "На промоция от: {savings} !"; soldout "Изкупено".

### 4.2 `collection-grid-item.liquid` (collection card)
```
<div class="collection-grid-item">
  <a class="collection-grid-item__link" href="{collection.url}">
     <div class="collection-grid-item__image-wrapper"><img class="zoom-fade-animation-element">{load_spinner}<span class="collection-grid-item__image-wrapper-overlay"></span></div>
     [placeholder] <div class="collection-grid-item__overlay">{collection-N svg}</div>
  </a>
  <div class="collection-grid-item__info">
     <div class="collection-grid-item__title h4"><a>{collection.title|"Името на вашата колекция"}</a></div>
     [list-collections only] <div class="collection-grid-item-products-count"><span>(N) продукти</span></div> + <div class="collection-grid-item__button_wrapper"><a class="btn btn--secondary"><span>Разгледай</span>{tail-right}</a></div>
  </div>
</div>
```

### 4.3 `product-price.liquid` & `product-price-listing.liquid`
See §0.7. Listing version adds `.price--listing`, `.price__compare`, and uses `from_lowest_price_html` when `product.price_varies`. Both emit `{X.XX} лв / {X.XX×0.51} €`.

### 4.4 `cart-items.liquid` (cart row — drawer & page)
```
<div class="Cart__ItemList">
  [page only] <div class="Cart__Head"><span class="Cart__HeadItem h6">Продукти</span><...>Цена</span><...>Количество</span><...>Тотално</span><span></span></div>
  <div class="CartItem">    (wrapped in .CartItemWrapper for drawer)
     <div class="CartItem__ImageWrapper AspectRatio"><a><div class="AspectRatio" style="--aspect-ratio"><img class="CartItem__Image"></div></a></div>
     <div class="CartItem__Info">
        <h5 class="CartItem__Title"><a>{product.title}</a></h5>
        <p class="CartItem__Variant">{variant.title}</p>
        <ul class="CartItem__PropertyList"><li class="CartItem__Property"></li></ul>
        <ul class="CartItem__DiscountList"><li class="CartItem__Discount">{sale icon}{title}: -{amt} лв / {amt×0.51} €</li></ul>
        ... price, quantity stepper, remove ...
     </div>
  </div> ...
</div>
```

---

## 5. SHARED HEADER/BREADCRUMB SNIPPETS

### 5.1 `custom_page_header.liquid` (banner header used by collection/cart/blog/article/page/search/main-page)
```
[image] <div class="custom_page_header_section {article_custom_header_with_author_info?} {breadcrumbs_without_margin?}">
   {% render 'image-style' %}
   <img srcset(375..2800)>
   <div class="custom_page_header_opacity"></div>          ← overlay (inline style bg + opacity)
   <div class="page-width">
      <h1 class="h2 page_header_heading">{heading}</h1>
      {breadcrumbs}
      [collection] <div class="custom_header-filters-toolbar-block"><div class="filters-toolbar"><button class="open_mobile_sidebar btn btn--primary"><span>Филтър</span></button><button class="collection__layout-button is-selected" data-layout-mode="grid">{grid}</button><button data-layout-mode="list">{list}</button>[sort select#SortBy]</div></div>
      [article] <div class="article-page"><div class="article_header_meta-info"><div class="article__grid-meta"><span class="article__date"></span>...</div>{% render 'article_author_block' %}</div></div>
   </div>
   <style> #shopify-section-header{position:absolute;top:var(--announcement-bar-height)} .custom_page_header_opacity{background:{overlay};opacity:{opacity}%} </style>
</div>
[no image] <div class="page-width"><div class="section-header"><h1 class="h2 page_header_heading">{heading}</h1>{breadcrumbs}</div></div>
```

### 5.2 `breadcrumbs.liquid`
Hidden on index/404. `<nav class="breadcrumbs"><ol class="breadcrumbs__list"><li class="breadcrumbs__item"><a class="breadcrumbs__link" href="{root}">Начало</a></li> ...per-type (page/product/collection/blog/article)... </ol></nav>`. Collection w/ tags renders `.breadcrumbs__item.current_tag__item` chips with `+` separators. Breadcrumb link color `#FF1B5C`.

---

## 6. REAL BULGARIAN UI COPY (locale chain bg-BG → bg → en.default; resolved values)

| Key | Rendered text |
|---|---|
| general.breadcrumbs.home | Начало |
| general.search.placeholder | Търсене |
| general.search.submit | Потърси |
| general.search.title | Потърсете в нашия сайт |
| general.search.no_results | Няма резултати. Пробвайте да промените ключовите думи |
| general.search.products | Популярни продукти |
| general.search.search_title | Популярни търсения |
| general.search.results_with_count | {count} резултат(и) за “{terms}” |
| general.newsletter_form.email_placeholder | Имейл |
| general.newsletter_form.first_name_placeholder | Първо име |
| general.newsletter_form.last_name_placeholder | Фамилно име |
| general.newsletter_form.submit | Подай |
| general.newsletter_form.confirmation | Благодарим за абонирането! |
| general.404.suptitle | Страницата не е намерена ;( |
| general.404.title | Страница 404 |
| general.404.link | Обратно в началото |
| general.404.contact_btn | Свържете се с нас! |
| collections.general.add_to_cart / products.product.add_to_cart | Добави в количката |
| collections.general.sold_out | Изкупено |
| products.product.sold_out | Изпродадено |
| collections.general.choose_options | Опции |
| collections.general.quick_view | Бърз преглед |
| collections.general.pre_order / products.product? | Предварителна поръчка |
| collections.general.discount_html | На промоция от: {savings} ! |
| collections.general.items_with_count | {count} продукт / {count} продукти |
| collections.general.products | продукти |
| collections.general.browse_collections | Разгледай |
| collections.general.collection_label | Колекция |
| collections.general.grid / list | Мрежа / Лист |
| collections.sorting.title | Сортирай: |
| collections.sidebar.mobile_open_button | Филтър |
| products.product.on_sale | Промоция |
| products.product.quantity | Количество |
| products.product.vendor | Доставчик |
| products.product.in_stock | На склад и готов за изпращане |
| products.product.out_of_stock | Изчерпано количество |
| products.product.unit_price_label | Единична цена |
| products.product.view_in_space | Преглед във вашето пространство |
| cart.general.title | Количка |
| cart.general.subtotal | общо |
| cart.general.total | Общо в количката |
| cart.general.empty | Количката е празна. ;( |
| cart.general.note | Допълнително Съобщение |
| cart.general.note_placeholder | Вашето съобщение |
| cart.general.add_note | Добави съобщение |
| cart.general.checkout | Плащане |
| cart.general.continue_shopping | Продължете пазаруването |
| cart.items.product/price/quantity/total | Продукти / Цена / Количество / Тотално |
| cart.shipping_estimator.title | Оценка на доставката |
| cart.shipping_estimator.estimate | Калкулиране на доставка |
| cart.shipping_estimator.country/city/province/zip_code | Държава / Град / Провинция / ЗИП |
| cart.label.remove | Премахни {product} |
| contact.form.name/email/phone/message/submit | Име / Имейл / Телефонен Номер / Съобщение / Прати |
| layout.customer.log_in | Моят Акаунт |
| sections.header.all_categories | Всички Категории |
| sections.header.total | Всичко общо: |
| blogs.article.by_author | от {author} |
| blogs.article.read_more | Прочетете още |
| blogs.article.tags | Етикети |
| blogs.article.view_all_blogs | Вижте всички блогове |
| blogs.comments.comments_with_count | {count} коментар / {count} коментари |
| homepage.onboarding.product_title | Името на вашия продукт |
| homepage.onboarding.collection_title | Името на вашата колекция |
| homepage.onboarding.blog_title | Заглавието на публикацията ви |
| homepage.onboarding.no_content | В момента този раздел не включва съдържание… |
| Dynamic checkout btn (forced via JS) | Купете сега |

---

## 7. BUILD NOTES / GOTCHAS FOR THE PORTER
1. **Prices are dual-currency lev/euro at ratio 0.51**, NOT Shopify money. Render `{lev} лв / {euro} €` everywhere a price appears (card, PDP, drawer). Compare-at (strikethrough) uses plain money.
2. **Accent color is `#ff1b5c`** (not generic blue). Announcement bar is `#fd5b2a` orange. Footer is pure black. Body bg is `#f4f4f4` (off-white, not pure white).
3. **Header logo align is `inline`** with rounded logo image (border-radius 20px via custom_css); main menu is empty on this store (`main_linklist=""`) — nav links come from whatever menu is assigned; treat header nav as data-driven.
4. **Slideshow is HIDDEN on mobile** (custom_css `display:none @max-width:750px`). Build a mobile fallback or hide accordingly.
5. Sliders are **Flickity** (`data-flickity-config`); replicate carousel behavior (wrapAround, groupCells, autoPlay, pageDots).
6. Section header pattern is consistent: `<span class="h5">{subtitle}</span>` (eyebrow, styled with `:before` underline when `homepage_subtitle_color=match_header`) + `<h2>{title}</h2>`. Reuse a `<SectionHeader>` component.
7. Typography scale comes from `css-variables.liquid`: H1 desktop = `type_header_base_size×2` = 80px, H2 = ×1.3 ≈ 52px, mega-title-large = ×2.5 = 100px. Header font Neue Haas Unica (bold n7), body n4, nav Archivo Narrow.
8. Buttons always: `.btn.btn--{variant}` with `<span>label</span>` + trailing arrow icon. Circle slider arrows = `.btn.btn--circle-arrow`.
9. Cards: `.product-item-block` wrapper, `.product-card`, image `.product-card__image` with hover-swap `.product-card__image--alternate`, title `.h4.product-card__title`, price row `.product-item__price_and_reviews_row`.
10. Free-shipping threshold is **105** (shown in cart/drawer); newsletter & contact submit to Shopify customer/contact forms.
11. Index sections 7,8 and product-newsletter and page.contact's extra sections are DISABLED — do not render them.
12. Width containers: `.page-width` and `.page-width-small`. Grid uses fractional classes (§0.3) — implement as a responsive 12-ish fraction utility set or map to Tailwind grid spans.

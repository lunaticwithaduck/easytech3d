# Scout: theme-js — Interaction Catalog (BEHAVIOR source of truth)

Source theme: Shopify "Warehouse"-derived custom theme at `c:/Users/lyubomir.pacheliev_o/Downloads/theme/`.
This catalogs the JS interactions a build agent must reproduce 1:1 in React. Every selector, data-attr, class name, and config value below is copied verbatim from the theme. Do NOT invent generic Tailwind equivalents — match these exact class names and behaviors.

## 0. Global setup / how sections boot

- `assets/theme.js` (296KB) is the monolith. `assets/core.js` defines a `Core extends HTMLElement` web-component base (autobind, IntersectionObserver `onIntersect`, pub/sub via `document` events keyed by `sectionId`). Most homepage interactions, however, run through the legacy `theme.Sections` registry, NOT web components.
- Boot: `document.addEventListener('DOMContentLoaded', ...)` → `var sections = new theme.Sections()` then `sections.register('<data-section-type>', theme.XHandler)`. Each DOM node with `data-section-type="X"` instantiates `new theme.X(container)`.
- Registration map (theme.js ~9071-9099):
  - `slideshow-section` → `theme.SlideshowSection` (HERO — custom fade slider, NOT Flickity)
  - `featured-products` → `theme.FeaturedProducts` (tabs + Flickity carousel)
  - `collection-list` → `theme.CollectionListSection` (Flickity carousel)
  - `header-section` → `theme.HeaderSection`; header itself inits via `theme.Header.init()` + `theme.MobileNav.init()`
  - `product` / `product-template` → `theme.Product` (gallery + variants + photoswipe + qty)
  - `cart-template` → `theme.Cart` (ajax drawer)
  - `announcement-bar` → `theme.AnnouncementBar` (Flickity), `logo-bar` → `theme.LogoBar` (Flickity)
  - `index-accordion` → `theme.HomepageAccordion`; `search-template` → `theme.MainSearchPage`
- `collection-page.js` registers `collection-template` → `theme.Collection` separately (filters/sort/sidebar).
- Global config object injected in `layout/theme.liquid` (~83-163):
  - `theme.breakpoints = { medium: 750, large: 990, widescreen: 1400 }` — **medium=750px is THE breakpoint** used everywhere (`min-width: 750px` = desktop).
  - `theme.strings.{addToCart, added_to_cart, preOrder, soldOut, ...}` localized strings.
  - `theme.moneyFormat`, `theme.searchMode` (settings.search_mode), `theme.pageType` (request.page_type).
  - `window.routes = { rootUrl, cartUrl, cartAddUrl, cartChangeUrl, searchUrl, productRecommendationsUrl }`.
- Vendor libs (`assets/vendor.js`): **Flickity v2.2.2**, `SV.HoverIntent` (custom hover-intent, see §4), PhotoSwipe + PhotoSwipeUI_Default. `assets/delegate.js` = event delegation (`new Delegate(el).on(type, selector, fn)`). `assets/ajaxinate.js` = infinite scroll for collection.

---

## 1. HERO SLIDESHOW (homepage) — `theme.Slideshow` / `theme.SlideshowSection`

IMPORTANT: The homepage hero is the **custom fade slideshow**, NOT Flickity. (Flickity is used for product carousels/announcement/logo bars — see §2.)

- Section: `sections/slideshow.liquid`, `data-section-type="slideshow-section"`. Handler `theme.SlideshowSection` (theme.js 8007) wraps `theme.Slideshow` (theme.js 2864).
- Homepage `templates/index.json`: first section type `slideshow`, 4 image blocks (one disabled). **Real settings:** `autorotate: true`, `autorotate_speed: 6` (→ 6000ms), `show_dots: true`, `show_buttons: true`, `slideshow_height: "small"`, `slideshow_mobile_height: "medium"`, `text_size: "large"`, `slideshow_width: "full"`.
- **CRITICAL custom_css on the section:** `@media (max-width: 750px) {.slideshow {display: none; }}` — the hero is HIDDEN on mobile (<750px). Reproduce this.

### Markup (slideshow.liquid)
- Root wrapper `#SlideshowWrapper-{id}.slideshow-wrapper[role=region][data-slider]`.
- Track `#Slideshow-{id}.slideshow.slideshow--{height}.mobile-slideshow--{mobileHeight}` with attrs: `data-slider-container`, `data-autorotate="{true|false}"`, `data-speed="{autorotate_speed*1000}"`, `data-adapt-height="false"`, `data-slideshow_height`.
- Each slide: `#slickSlide-{block.id}.slideshow__slide.slideshow__slide--{block.id}` (+`slideshow__slide--active` on first), `block_type__{image|video}`, attrs `data-slider-slide-index="{i}"`, `data-slider-item`.
  - Image: `.slideshow__image_wrapper > img.slideshow__image.box` (responsive srcset 375→2800w, `object-position` from focal point). Mobile alt image gets `medium-up--hide`, desktop image gets `small--hide` when a mobile image exists.
  - Overlay: `.slideshow__overlay#slideshow__overlay_{block.id}` whose `::before` gets `opacity: {image_overlay_opacity}%` and `background-color: {color_image_overlay}` via inline `<style>`. Title/subtitle color set per-slide via inline style.
  - Text: `.slideshow__text-wrap--desktop > .slideshow__text-content.slideshow__text-content--vertical-{top|center|bottom}.text-{left|center|right} > .page-width-small`. Title `h2.h1.mega-title.slideshow__title` (+`mega-title--large` if text_size large). Subtitle `span.mega-subtitle.slideshow__subtitle` (+`--large`). Buttons `a.btn.slideshow__btn.btn--{style}` (styles: primary|secondary|white|transparent_primary|transparent_secondary), with trailing `icon 'tail-right'`.
  - If a slide has only `button_link` (no labels) the whole slide is wrapped in `<a href>`.
- Controls `.slideshow__controls.page-width-small` (+`arrows_only` if no dots):
  - Dots: `ul.slick-dots[data-slider-indicators] > li[data-slider-indicator]` (first `li.slick-active`) `> a[href="#Slideshow-{id}"][data-slide-number="{i}"][aria-controls=...]`.
  - Arrows: `.slideshow__arrows > button.slideshow__arrow.slideshow__arrow-previous.btn.btn--circle-arrow[data-slider-button]` and `.slideshow__arrow-next[data-slider-button][data-slider-button-next]`, each contains `icon tail-left`/`tail-right`.

### Behavior (theme.Slideshow)
- Selectors: button `[data-slider-button]`, indicators wrapper `[data-slider-indicators]`, indicator `[data-slider-indicator]`, track `[data-slider-container]`, item `[data-slider-item]`.
- Classes: active slide `slideshow__slide--active`; active dot `slick-active`. Options default `{ type:'fade', autoplay:false, slideInterval:0, canUseKeyboardArrows:true }`. `SlideshowSection` passes `autoplay = data-autorotate==='true'`, `slideInterval = data-speed`.
- Type is `fade`: changing slide just toggles `slideshow__slide--active` on the target `[data-slider-item]` (`_setupActiveSlide` removes active from all, adds to index). CSS does the cross-fade. No transform.
- **Autoplay:** `startAutoplay()` = `setTimeout(() => _setPosition(nextIndex), slideInterval)`. Re-armed inside `_setPosition` after each change. `stopAutoplay()` clears timeout. Autoplay stops on arrow/dot click and on focusin; resumes on focusout if focus left the container.
- **Next index** wraps around (`_getNextSlideIndex`). Prev arrow `[data-slider-button]` (not `-next`) → `previousSlide`, next `[data-slider-button-next]` → `nextSlide`.
- **Dots:** click on `data-slider-indicator a` → `_onClickIndicator` reads `data-slide-number`, calls `goToSlideByIndex`, sets `slick-active`. Enter key on dot also triggers.
- **Keyboard:** when slideshow focused, ArrowLeft/Right move, Escape blurs.
- On each change dispatches `slider_slide_changed` CustomEvent (detail = index). `SlideshowSection._onSliderSlideChanged` syncs `.slideshow__text-content--mobile-active` on `[data-slider-mobile-content-index]` and plays/pauses video slides (`block_type__video`).
- React port: a fade carousel, autoplay 6000ms, wrap-around, dots + circle arrows, keyboard, pause on hover/focus, hidden below 750px. Track active index in state, toggle `slideshow__slide--active`.

---

## 2. FEATURED-PRODUCTS (tabs + Flickity carousel) — `theme.FeaturedProducts`

- Section `sections/featured-products.liquid`, `data-section-type="featured-products"`. Handler theme.js 6152.
- Homepage uses this **3 times** (PLA filaments, ABS/ASA, spare parts). Each has up to 3 collection "blocks" rendered as tabs. Real settings include `enable_carousel:true`, `show_dots:true`, `show_arrows:true`, `grid:4`, `grid_mobile:"1"`, `navigation_style:"large"|"normal"`, `enable_autoplay` (true on most, speed 4-5).

### Markup
- `.index-tabs-collections-wrapper.section_main_content`.
- Header `.section-header.page-width` with `span.h5` (subtitle, e.g. "Най-Популярни") + `h2` (title, e.g. "Филаменти за 3D принтер").
- Tabs nav `.index-tabs_nav__wrapper.navigation_style_{large|normal} > .index-tabs_nav`. Each tab `a.index-tabs_nav--item[data-index][data-href="tab_{handle}_{block.id}"]` (first has `active`); contains `h2`/`h3` of `block.settings.heading`.
- Custom arrows `.slider_custom_arrows > a.button-prev.btn.btn--circle-arrow` + `a.button-next...` (only when `show_arrows && enable_carousel`).
- Tab panels `.section-tabs-content > .index-tabs-content_block#tab_{handle}_{block.id}` (first `active`).
- When `enable_carousel`: panel contains `.index-tabs-content_block__slider.slides_{N}` with `data-flickity-config='{...}'`. Cards via `snippet product-card-item`.
- Flickity config (`featured-products.liquid` 12-24):
  ```json
  { "prevNextButtons": false, "wrapAround": true, "dragThreshold": 15,
    "watchCSS": true, "cellAlign": "left", "pauseAutoPlayOnHover": true,
    "autoPlay": <cycle_speed*1000 | false>, "pageDots": <show_dots>,
    "groupCells": <grid> }
  ```
  `watchCSS:true` ⇒ Flickity only enables when CSS sets `:after{content:'flickity'}` (desktop). `groupCells = grid` (4) ⇒ pages of 4. `cellAlign:left`, `wrapAround:true`.
- grid→cell-width class mapping: 2→`medium-up--one-half`(maxH 530), 3→`one-third`(345), 4→`one-quarter`(250), 5→`one-fifth`(195).

### Behavior
- On init: parse `data-flickity-config` from `.index-tabs-content_block__slider`, `new Flickity(slider, opts)`, add class `rendered` to slider element.
- **Custom arrows:** click `.slider_custom_arrows .btn`; `.button-next` → `flickity.next()`, else `flickity.previous()`.
- **Tabs:** click `.index-tabs_nav--item`:
  1. remove `active` from current tab + its panel; if old panel slider is `flickity-enabled`, `flickity.destroy()` + remove `rendered`.
  2. add `active` to clicked tab + its panel (`#tab_...`).
  3. `new Flickity()` on the newly visible panel's slider, add `rendered`. Show/hide `.slider_custom_arrows` (`.hide`) based on cell count > 1.
- Also wires every `[action="/cart/add"]` form via `theme.AddItemToCart` (§9) and `theme.ProductItemSwatches` (§10).
- Re-render note (theme.js ~9427): on resize, sliders with `.index-tabs-content_block__slider.flickity-enabled` are re-resized via `Flickity.data(item).resize()`.
- React port: tabbed panels, only active panel mounts a carousel. Carousel = paged (4 per page desktop), wrap-around, optional autoplay, no built-in arrows/dots (custom prev/next buttons + optional dots). Below desktop (`watchCSS`) the carousel is disabled → plain horizontal scroll / stacked.

---

## 3. COLLECTION-LIST carousel — `theme.CollectionListSection`

- Section `sections/collection-list.liquid`, `data-section-type="collection-list"`. Handler theme.js 6259.
- Homepage block "Всички Категории": `section_style:"carousel"`, `grid:5`, `image_style:"circle"`, `show_arrows:true`, 7 collection blocks, button "Вижте категориите" → `/collections`.
- Slider element `.collection-list__slider` with `data-flickity-config`:
  ```json
  { "prevNextButtons": false, "wrapAround": true, "dragThreshold": 15,
    "cellAlign": "left", "pauseAutoPlayOnHover": true,
    "autoPlay": <cycle_speed*1000 | false>, "pageDots": false,
    "watchCSS": <true if blocks_size==grid && blocks_size>=4 else false> }
  ```
- Behavior: `new Flickity()`. If `watchCSS`: special mobile-resize logic — on `window.resize` when `innerWidth<=1199`, removes `rendered`, calls `flickity.resize()`, re-adds `rendered` after 1000ms (`resizeMobileFlag` guard). Else immediately add `rendered`.
- Custom arrows `.slider_custom_arrows .btn` → next/previous; if `watchCSS`, arrows get `desktopHide`.
- Also wires add-to-cart forms + `ProductItemSwatches`.
- React port: circle-image collection cards in a wrap-around carousel with custom prev/next arrows, no dots, optional autoplay. 5-up desktop. `watchCSS` semantics: carousel only on desktop when item count == columns.

---

## 4. MEGA-MENU (desktop hover) + dropdowns — `theme.Header`

Handler theme.js 1934. `theme.Header.init()` runs from header section.

### Two menu systems
1. **Main nav** (`#AccessibleNav .main_nav-bar_linklist`): top items `li.nav-bar__item` (+`item-has-mega-menu` if has children, +`mega_menu_main_parent` if a mega_menu block matches). Link `a.nav-bar__link.link[data-type=menuitem][aria-haspopup][aria-expanded]` with `icon arrow-bottom` + `icon nav-triangle`. Dropdown rendered by `snippet desktop-menu` → either a `.mega-menu` (snippet `mega-menu.liquid`) or nested `ul.nav-dropdown` (recursive, up to 3 levels).
2. **Categories menu** (`.categories_menu .nav-bar__item.item-has-mega-menu`): hamburger-style "All Categories" button `a.categories_main_link.btn.btn--primary`; dropdown via `snippet categories-menu` → `ul.first_lvl.nav-dropdown.categories-nav-dropdown`, nested `.second_lvl`/`.third_lvl` with optional `.nav-dropdown-image-block` promo image.

### Desktop hover-intent (the actual mega-menu trigger)
- Uses `SV.HoverIntent` (vendor.js 74) on:
  - `.site-header__mobile-nav .item-has-mega-menu` (nav bar links)
  - `.has-mega-menu` (menu items)
- Config: `{ exitDelay: 300, interval: 100, sensitivity: 7 }`.
- `onEnter(el)` → `el.classList.add('visible')` + close search dropdown + `hideDropdown()`. `onExit(el)` → remove `visible` + blur child `.link`s.
- HoverIntent algorithm (reproduce): track mouse, on mouseenter start poll every `interval`ms; if mouse movement distance `< sensitivity` (7px) between polls ⇒ fire `onEnter`; on mouseleave wait `exitDelay`ms then `onExit` (cancellable if re-enter). So mega-menu opens when pointer settles on the item, closes 300ms after leaving.
- **So: mega-menu visibility = `.visible` class on the parent `li`.**

### Click-based dropdown (keyboard/secondary)
- `[data-has-dropdowns]` parents get click → `submenuParentClickHandler` toggles `site-nav--active-dropdown` (showDropdown/hideDropdown). `showDropdown` sets `aria-expanded=true`, after 250ms binds `keyup`(Esc closes) + `body click`(closes). Right/left positioning auto-computed (`isRightOfLogo`, `overlapDropdown` add `.right_side`/`site-nav__dropdown--right`).
- `positionFullWidthDropdowns()`: centered dropdowns get `top = el.offsetTop + 41 px`.
- Resize → debounced (50ms) re-style + re-position.
- Locale/currency selectors use `theme.Disclosure` (theme.js 4639).

### React port
- Desktop (≥750px): hover-intent open/close of mega panel (`.visible`), 300ms close delay, 7px sensitivity. Keep `nav-bar__item`, `item-has-mega-menu`, `has-mega-menu`, `mega-menu`, `nav-dropdown`, `mega-menu__column/__title/__linklist/__link/__promo` class names. Mega panel markup (mega-menu.liquid): `.mega-menu > .page-width > .mega-menu__inner.(--left|--center|--large) > .mega_menu_columns__wrapper > .mega-menu__column (span.mega-menu__title + ul.mega-menu__linklist > li.mega-menu__item > a.mega-menu__link)` + optional `a.mega-menu__promo` image blocks.

---

## 5. MOBILE NAV (drawer + multi-level) — `theme.MobileNav`

Handler theme.js 2460. `theme.MobileNav.init()`.

### Selectors / classes
- Toggle button `.js-mobile-nav-toggle` (icon classes `mobile-nav--open`/`mobile-nav--close`).
- Container `.mobile-nav-wrapper`, list `#MobileNav`, overlay `.mobile_menu_overlay`.
- Sub-toggle buttons `.js-toggle-submenu` (with `data-level`, `data-target`).
- State classes on container: `js-menu--is-open` (open), `sub-nav--is-open`, `third-nav--is-open`, `fourth-nav--is-open`. Item classes `mobile-nav__item`, link `mobile-nav__link`, sub `mobile-nav__sublist-link`, return btn `mobile-nav__return-btn`, active `is-active`, closing `is-closing`.
- Dropdown panels `.mobile-nav__dropdown[data-parent][data-level]`.

### Behavior
- **Open** (`openMobileNav`): closes search + cart drawers first. Adds `js-menu--is-open` to container AND `body`. Computes `mobileNav.style.minHeight` from tallest dropdown. Sets container `top = siteHeader.offsetHeight`px. Traps focus on `#shopify-section-header`. Toggle gets `mobile-nav--close`, `aria-expanded=true`. Esc key closes.
- **Close** (`closeMobileNav`): removes all nav state classes from container + body, releases focus trap on transitionend, `window.scrollTo(0,0)`.
- **Sub-nav** (`toggleSubNav`→`goToSubnav`): clicking `.js-toggle-submenu` slides to child panel `.mobile-nav__dropdown[data-parent="{target}"]`; level read from `data-level` on the panel. Level>2 (not 4) ⇒ `third-nav--is-open`; level 4 ⇒ `fourth-nav--is-open`; else `sub-nav--is-open`. Return button (`mobile-nav__return-btn`) goes back one level (uses `data-level`). `isTransitioning` guard. Old panel gets `is-closing` during transition.
- mql `(min-width:750px)` listener: if resized to desktop while open, auto-close.
- Exposes `theme.MobileNav.closeMobileNav()` used by header cart/search handlers.

### React port
- Off-canvas drawer slides under header (top = header height). Multi-level push navigation (slide panels left), level classes drive transform. Body scroll lock via `js-menu--is-open` on body. Hamburger toggles open/close icon. Overlay click + Esc close.

---

## 6. PREDICTIVE / LIVE SEARCH — `theme.SearchBar` + `theme.Header` toggle

Handler `theme.SearchBar` theme.js 8658; instantiated when `.site-header[data-enable_live_search="true"]` → `new theme.SearchBar('.search-bar__interior')`.

### Markup (header.liquid ~182-300)
- `.search-bar__interior` (toggle button `button.header-search-button` + `icon search-loop`).
- `.search-form__container[data-search-form-container]` (the dropdown panel; opened class `show_form`).
- Optional category filter `#search-product-type[data-search-type="*"]` (`ul > li > a[data-value]`), label `.search_categories_button__label`.
- Form `form.search-form.search-bar__form[action=routes.search_url][method=get][role=search]`. Input `#predictive-search-drawer-input[name="q"][data-predictive-search-drawer-input]` placeholder from locale. Hidden `input[name="options[prefix]"][value="last"]`.
- Results popover `.predictive-search-wrapper.predictive-search-wrapper--drawer[aria-hidden]` containing `.predictive-search` with: popular searches `.search_popular_searches_menu`, results `.search-bar__results[aria-hidden] > .search-bar__results-inner`, popular products `.search_popular_products > ul#predictive-search-results.predictive-search__list > li.predictive-search-item > a.predictive-search-item__link` (image `.predictive-search-item__image`, title `.predictive-search-item__title-text`, price `.predictive-search-item__price`).

### Behavior — SearchBar
- Uses `Delegate` on `.search-bar__interior`:
  - `focusin [name=q]` → `_onInputFocus`: add `is-fixed` to interior, `no-mobile-scroll` to body, set popover `aria-hidden=false`, input `is-filled`, form `is-expanded`.
  - `focusout [name=q]` → `_onFocusOut`: on touch devices, no-op. Else remove `is-fixed`/`no-mobile-scroll`; if focus left container, hide popover + remove `is-expanded`.
  - `input [name=q]` → **debounced 250ms** → `_doSearch`.
  - `keydown [name=q]` Tab(9) → focus first result link.
  - `click #search-product-type` → `_productTypeChanged` (sets `productTypeFilter`, re-search; `'All Categories'` ⇒ empty filter).
  - `submit [type=submit]` → `_onFormSubmit`: empty value ⇒ preventDefault; else clones input as hidden field with value `q*` (and `product_type:{type} AND ` prefix) so search uses prefix wildcard.
- **`_doSearch`** (the AJAX): builds `productQuery = (product_type:{filter} AND )? + value + '*'`. Fetches `routes.searchUrl + '?view=ajax&q=' + productQuery + '&type=product'` (GET, same-origin). If `theme.searchMode !== 'product'`, also fetches a second query with the other type(s). Uses "last request wins" (`lastInputValue === currentInput` guard). Joins HTML, moves any `.search-bar__view-all-button-wrapper` to end, injects into `.search-bar__results-inner`. Toggles `added_results` class on popover based on content length. Empty input clears results + removes `added_results`.
- Outside `document` click that isn't inside `.search-bar__form` collapses popover.

### Toggle (theme.Header)
- Click `.header-search-button`: closes mobile nav + cart drawer; toggles `.search-form__container.show_form` + `active` on button + `body.show_overlay`/`show_search_overlay`. Outside click (not inside `.search-bar__interior`) closes.
- `#search-product-type` click sets `data-search-type`, updates label, re-triggers input keyup.
- Header submit button `.search-button__submit` builds `searchUrl?q={value}*[ AND product_type:{type}]&type={searchMode}` and navigates.

### React port
- Debounced (250ms) fetch to `/search?view=ajax&q={term}*&type=product` (+ wildcard `*`, optional `product_type:` prefix). Render returned HTML/parsed results into a popover. Last-write-wins. Category dropdown filters by product_type. Popover state via `aria-hidden`, `is-expanded`, `added_results`. Submit appends `*` wildcard. Show popular searches/products before typing.

---

## 7. PRODUCT GALLERY (Flickity) + PhotoSwipe zoom + thumbnails + variants

Handler `theme.Product` (theme.js 6446) → inner `Variants` class with `_initGallery` (theme.js 878).

### Main gallery
- Element `.product-single__media__carousel[data-product-main-slider][data-flickity-config]` (+`product_image__zoom` when image zoom enabled). Slides `.product-single__media__slide[data-media-id][data-media-index]`, rendered by `snippet media`.
- Main Flickity config (product-template.liquid 50-62):
  ```json
  { "prevNextButtons": true, "pageDots": false, "adaptiveHeight": true,
    "cellAlign": "left", "contain": true, "pauseAutoPlayOnHover": true,
    "dragThreshold": 8, "initialIndex": <initial_media_index>,
    "arrowShape": {"x0":20,"x1":60,"y1":40,"x2":60,"y2":35,"x3":25} }
  ```
- On init: `new Flickity(main, opts)` + add `rendered`. `flickity.on('select', ...)` plays/pauses video & model media in the selected vs. other slides (HTML5 `<video>`, YouTube via `YT.get(id)`, Vimeo via `new Vimeo.Player`, model-viewer dispatch `mediaVisible`/`mediaHidden`).

### Thumbnails
- `.product-single__thumbnails` (+`thumbnails-slider` if slider mode, else `thumbnails-grid`) with `data-thumb_flickity_options`. Slider config: `prevNextButtons:false, pageDots:false, contain:true, cellAlign:left, dragThreshold:8` + `asNavFor` set to main slider in JS (`thumbnails_slider_options.asNavFor = main_slider`).
- Grid mode: each `.product-single__thumbnail-image` click → `flickityInstance.select(index)`.

### PhotoSwipe zoom
- Only when `.product_image__zoom` present. Each `.image_type` image in main slider gets click handler:
  - Builds `items[]` from every `.image_type`: `{ src: data-image-url, w: +data-image-width, h: +data-image-height }`.
  - `new PhotoSwipe(document.querySelectorAll('.pswp')[0], PhotoSwipeUI_Default, items, { index })` then `.init()`.
- PhotoSwipe root markup from `snippet pswp.liquid` (standard `.pswp` skeleton: `.pswp__bg`, `.pswp__scroll-wrap > .pswp__container > 3×.pswp__item`, `.pswp__ui` with counter, close/share/fs/zoom buttons, arrows `.pswp__button--arrow--left/right`, caption). CSS `assets/photoswipe.css` + `default-skin.css`/`default-skin.svg`.

### Variants / color swatches (product page)
- `Variants._onSelectChange` (theme.js 1092): on any option `change`, finds matching variant from `product.variants`, updates master select, dispatches `variantChange` CustomEvent, then `_updateImages` + `_updatePrice` + `_updateSKU`, optional history state.
- `_updateImages` (1147): if product has per-option media (`.all_media__block`), it **rebuilds** the Flickity slider — destroys, removes old `[product-image-media]` slides, clones matching `[data-media-option-name][data-media-option-value]` slides, re-inits gallery at the variant's featured-media index. Otherwise just `flickity.selectCell(featuredMediaIndex)`.
- Swatch markup (`snippet swatch.liquid`): `.swatch[data-option-index] > .swatch_elements_wrapper > .swatch-element(.color)(.available|.soldout).swatch_{handle}` each with hidden `input[type=radio][name="option-{i}"]` + `label` (color → `background` via `color_swatch_customization` or variant image; sold-out shows `img.crossed-out` + `soldout.png`). `.tooltip` per color. Radios hidden via inline CSS; labels are the visible chips (min-width 30px, border `--color-border-form`).

### Quantity selector
- Markup (product-template.liquid 553-566): `.qty.product-page-qty > a.minus_btn.qty_btn` + `input[name=quantity][data-quantity-input][value=1][pattern="[0-9]*"]` + `a.plus_btn.qty_btn`.
- Behavior (theme.js 6569): click `.qty_btn` → find `.qty [name=quantity]`, `minus_btn` decrements else increments, clamp min 1, write back. (Pure DOM, no fetch.)

### Mobile sticky CTA
- `.product-form-sticky-parent`: on scroll, if `window.scrollY > (offsetTop+height+headerHeight)` add `enabled_mobile_sticky_btns` to `.product-single__meta`, else remove. (theme.js ~7070-7090.)

### React port
- Main image carousel (Flickity-style): arrows on, no dots, adaptive height, contain, drag threshold 8, starts at variant's media. Thumbnails as nav-for (click selects main). Click main image → PhotoSwipe-style lightbox built from all gallery images (src/w/h). Variant selection swaps/rebuilds gallery and updates price/SKU; radio swatches with color/sold-out states. Qty stepper clamped to ≥1.

---

## 8. QUICK-VIEW MODAL — global handler (theme.js 9103)

- Modal element `#modal-quick-view.modal[aria-hidden]` (`snippet modal-quick-view.liquid`): `.modal__dialog.modal__dialog--stretch > button.modal__close.close-quick-view` (+ `icon close`), `.modal__loader` (+ `icon search-loader`), `.modal__inner` (empty, filled by AJAX).
- **Open:** `document` click on `.open-quick-view--btn` (or descendant):
  1. `e.preventDefault()`; build `productUrl = origin + data-product-url`; `modal = getElementById(target.aria-controls)`; add `is-loading`.
  2. set `?view=quick-view`; `fetch(productUrl, {credentials:same-origin, GET})`.
  3. inject response text into `.modal__inner`; remove `is-loading`.
  4. `new theme.Product(modal.querySelector('[data-section-type="product"]'))` to wire the inner product (gallery/variants/qty). Re-init `Shopify.PaymentButton`.
  5. `body.show_overlay`, modal `aria-hidden=false`.
- **Close:** `document` click on `.close-quick-view` (or descendant) → modal `aria-hidden=true`, clear `.modal__inner`, remove `body.show_overlay`.
- Adding to cart from quick-view auto-closes it (`Cart._onProductAdded` clicks `.close-quick-view`).
- React port: button `.open-quick-view--btn[data-product-url][aria-controls]`; fetch product quick-view fragment (template `product.quick-view.json` exists), render in modal, mount product interactions, overlay + aria-hidden toggling. Close on X / overlay / Esc.

---

## 9. CART — AJAX add + drawer — `theme.AddItemToCart` + `theme.Cart`

### Add to cart (`theme.AddItemToCart`, theme.js 6340)
- Attached to every `form[action="/cart/add"]`. On submit:
  - `preventDefault`; `fetch('/cart/add.js', {POST, x-www-form-urlencoded, X-Requested-With: XMLHttpRequest, body: serialize(form)})`.
  - On success: add `added` class to submit btn, set `[data-add-to-cart-text]` to `theme.strings.added_to_cart`, call `theme.Cart.prototype._onProductAdded()`. After 2000ms revert button text to `addToCart` (or `preOrder` if pre-order button), toggle `.pre_order_text.hide`.

### Cart drawer (`theme.Cart`, theme.js 5030)
- Section `data-section-type="cart-template"` with `data-section-settings='{type,itemCount,totalPrice,drawer,hasShippingEstimator}'`. Drawer markup `snippet cart-drawer.liquid`: `#sidebar-cart.Drawer.Cart-Drawer[aria-modal][role=dialog]` → `.Drawer__Header.cart-drawer-container` (`h3.Drawer__Title` + `button.Drawer__Close[data-action=close-drawer][data-drawer-id=sidebar-cart]`), `form.Cart.Drawer__Content > .Drawer__Main[data-scrollable]` (free-shipping notice + items).
- **Open drawer** (`_sidebarDrawerOpen`): add `show` to `#sidebar-cart`, `body.show_overlay`, trap focus on transitionend.
- **Header cart button** (`#HeaderCart[data-link-type]`, theme.Header): if `data-link-type=="drawer"` → close search + mobile nav, add `show` to `#sidebar-cart` + `body.show_overlay`, trap focus. Else navigate to `routes.cartUrl`.
- **Close:** `[data-action="close-drawer"][data-drawer-id]` click (`_closeModal` removes `show` + overlay). Also `document` click outside `.Cart-Drawer`/`#HeaderCart` closes drawer.
- **Qty update** (`_updateItemQuantity`): click `[data-action="update-item-quantity"]`/`[data-action="remove-item"]` or change `.QuantitySelector__CurrentQuantity`. Reads `data-line-id`, `data-quantity`, inventory attrs (`data-inventory_management/_qty/_policy`). If over inventory & policy!='continue' → show `.QuantitySelector__error-message`. Else `fetch(cartChangeUrl + '.js', {POST json {id, quantity}})` then `_rerenderCart`.
- **`_rerenderCart`**: `fetch(cartUrl + '?view=drawer|ajax&timestamp=' + Date.now())` → `_replaceContent`: swaps `.Cart` node inside `.Drawer__Main` (preserving scrollTop), updates `.header_cart_count` and `.cart_total_price` (formatMoney). Re-binds shipping estimator + note submit.
- **`_onProductAdded`**: closes any open quick-view; if `type=='drawer'` → `_rerenderCart().then(_sidebarDrawerOpen)`; else navigate to cart.
- Free-shipping threshold notice (`Cart__ShippingNotice`), note (`#CartSpecialInstructions` + `.CartSpecialInstructionsSubmit` → POST `/cart/update.js {note}`), shipping estimator (`.ShippingEstimator__Submit` → `/cart/shipping_rates.json`). Note: BG copy uses "лева" suffix in remaining-amount.
- React port: add via `/cart/add.js`; drawer state = `#sidebar-cart.show` + `body.show_overlay`; refetch cart fragment + update header count/total after each mutation; qty steppers per line item with inventory guard; close on outside click / X / Esc.

---

## 10. PRODUCT CARD swatches (grid) — `theme.ProductItemSwatches`

- Global `document` `change` listener (theme.js 6409). On `.color-swatch__radio` change:
  - `productItem = closest('.product-card')`, read `data-variant-url`; rewrite `href` on `.product-card__link-image` + `.product-card__link-title`.
  - If radio has `data-image-url` and different `data-media-id` than `.product-card__image`: swap image `srcset`/`src`/`width`/`height`/`data-media-id` (+ optional inline `data-max_img_width` style).
  - Remove `product-item-block--withAlternateImage` from `.product-item-block` (kills hover-alt-image once a swatch chosen).
- React port: per-card color radios that swap the card image + update the card's product link to the variant URL.

---

## 11. STICKY / OVERLAP HEADER

- No JS scroll-listener turns the header sticky in theme.js (it's CSS, `position`/sticky in `theme.css`; verify there). JS only manages **overlap mode**:
  - `theme.Header.init`: if `.site-header[data-enable_overlap_header="false"]` → add `showAlternateHeader` + `no-overlap` to `#shopify-section-header`, `body.no-overlap-header`.
  - `slideshow.liquid` inline script: if first section is NOT a full-width slideshow, add `showAlternateHeader` to `#shopify-section-header` (so the header isn't transparent-over-hero). On the homepage the hero is first & full-width ⇒ overlap header stays transparent at top.
- Announcement bar height tracked via CSS var `--announcement-bar-height` (set/cleared by `theme.AnnouncementBar`).
- React port: header has a transparent "overlap" variant when over a full-bleed hero (homepage), and an `showAlternateHeader` (solid) variant otherwise; sticky via CSS. Manage a `--announcement-bar-height` offset.

---

## 12. SECONDARY interactions (lower priority but present)

- **Announcement bar** (`theme.AnnouncementBar`, 5505): `.AnnouncementBar__Slider` Flickity from `data-flickity-config`; equalizes slide heights; sets `--announcement-bar-height`; `.AnnouncementBar__close_button` hides section + zeroes the CSS var.
- **Logo bar** (`theme.LogoBar`, 5560): `.logo-bar--slider` Flickity + custom `.slider_custom_arrows` next/prev. (Disabled on this homepage but present.)
- **Homepage accordion** (`theme.HomepageAccordion`, 5595): `.homepage_accordion .question` click toggles sibling `.answer.active` with JS height animation (set explicit px height then transition); only one open at a time; recalcs min-height on resize. (`index-accordion` section.)
- **Page accordion** (`theme.PageAccordion`, 5745) + **product description accordion** (`.product_description_accrordion .product_accordion__heading` click, theme.js ~6595) — same height-animation pattern.
- **Collection page** (`collection-page.js`, `theme.Collection`): sort `#SortBy` change → reload with `sort_by`; filter `#FilterTags` change → navigate to value; sidebar accordions (`.category-filters-section-title` toggles `.category-filters-area-list.active` height; on <750px auto-opens active ones); "show more" filters (`.show_more_options` expands `.advanced-filters` maxHeight); checkbox filters (`.advanced-filter a` → submit form / navigate with params); price range sliders (`.price_range` + `.filter-group-display__price-range-input`); layout toggle `[data-action="change-layout"][data-layout-mode=grid|list]` (saves to cart attribute `collection_layout`, toggles `view-mode-grid/list` on `.product-item-block`); mobile sidebar open/close (`.open_mobile_sidebar`/`.close-collection-sidebar` toggle `.collection-sidebar.show` + `body.show_overlay`); infinite scroll via `Ajaxinate` when `data-pagination_mode != 'standart'` (container `#AjaxinateContainer`, pagination `#AjaxinatePagination`).
- **Countdown timer** (`theme.CountdownTimer`, 6075). **Shop the look** (`theme.Shop_the_Look`, 8874, Flickity). **Product recommendations** (`theme.ProductRecommendations`, 7884, Flickity). **Quotes** (`theme.Quotes`, 7946, Flickity). **Featured blog** (`theme.FeaturedBlog`, 8373, Flickity). All use the same `data-flickity-config` + optional `.slider_custom_arrows` pattern.

---

## 13. Flickity config cheat-sheet (per component)

| Component | prevNextButtons | pageDots | wrapAround | autoPlay | groupCells | watchCSS | other |
|---|---|---|---|---|---|---|---|
| featured-products carousel | false | show_dots | true | speed*1000/false | grid (4) | true | cellAlign:left, dragThreshold:15, pauseAutoPlayOnHover |
| collection-list carousel | false | false | true | speed*1000/false | — | cond. | cellAlign:left, dragThreshold:15 |
| product main gallery | true | false | — | — | — | — | adaptiveHeight, contain, dragThreshold:8, initialIndex, custom arrowShape |
| product thumbnails | false | false | — | — | — | — | contain, dragThreshold:8, asNavFor=main (set in JS) |
| complementary products | false | false | true | false | — | — | cellAlign:left, dragThreshold:15 |
| announcement / logo bar | (from data) | (from data) | (from data) | (from data) | — | — | custom arrows |

Common: `cellAlign:"left"`, `pauseAutoPlayOnHover:true`, custom prev/next via `.slider_custom_arrows .btn` (`.button-next`→next else previous). Theme adds `rendered` class to slider element once Flickity inits. `watchCSS:true` means the carousel only activates on desktop (Flickity reads `:after{content:'flickity'}` from CSS at the desktop breakpoint).

---

## 14. Homepage section order + real BG copy (from templates/index.json)

1. `slideshow` (HERO) — 3 active slides: **"Nature3D"** / "Изключително качествен PLA на вече изключително достъпни цени" / btn "Яко, заведи ме!" → /collections/nature3d; **"RE3D"** / "Точните консумативи за Вашия 3D принтер са вече налични в EasyTech3D" / "Купете сега" → /collections/re3d; **"EasyTech3D"** / "Най-качествената 3D нишка за вашите най-смели проекти" / "Всички колекции" → /collections. autorotate 6s, dots+arrows. Hidden <750px.
2. `featured-products` — subtitle "Най-Популярни", title "Филаменти за 3D принтер"; tabs: PLA Pro / PLA / PETG. navigation_style large, grid 4, carousel+dots+arrows+autoplay 4s.
3. `featured-products` — subtitle "за истински ентусиасти", title "Филаменти за 3D принтер"; tabs PLA Flex / ABS / ASA. navigation_style normal.
4. `featured-products` — subtitle "3д принтери", title "Резервни части за 3D принтери"; tabs Дюзи / Легла / BL Тъчове.
5. `collection-list` — title "Всички Категории", carousel, circle images, grid 5, 7 collections, btn "Вижте категориите" → /collections.
6. `index-icons-with-text` — title "Защо да купувате от нас?", subtitle "от ентусиасти за ентусиасти"; 3 blocks: money-check "Ниски Цени", truck "Бързи Доставки", envelope "Поддръжка" (full BG copy in index.json).
7. `slideshow` (disabled), `logo-bar` (disabled).
8. `featured-blog` — title "Проверете нашият блог", subtitle "ако се интересувате от развития в принт светът", blog "3д-принтове", 4 posts.
9. `newsletter` — title "Абонирайте се към нашият мейл лист", subheading about promo notifications.
10. `apps` (Webrex breadcrumb).

---

## File reference index
- Boot / config: `layout/theme.liquid` (83-163), `assets/theme.js` `theme.Sections` (6), DOMContentLoaded (9071-9099), `assets/collection-page.js`.
- Hero: `theme.Slideshow` 2864 / `theme.SlideshowSection` 8007; `sections/slideshow.liquid`; `templates/index.json`.
- Featured products: `theme.FeaturedProducts` 6152; `sections/featured-products.liquid`; `snippets/product-card-item.liquid`.
- Collection list: `theme.CollectionListSection` 6259; `sections/collection-list.liquid`.
- Header/mega-menu: `theme.Header` 1934; `sections/header.liquid`; `snippets/{desktop-menu,mega-menu,categories-menu,site-nav}.liquid`; `SV.HoverIntent` `vendor.js` 74.
- Mobile nav: `theme.MobileNav` 2460.
- Search: `theme.SearchBar` 8658; header.liquid 182-300; `snippets/search-sidebar.liquid`.
- Product: `theme.Product` 6446 / `Variants._initGallery` 878; `sections/product-template.liquid`; `snippets/{swatch,thumbnails-gallery,thumb_media,media,pswp}.liquid`.
- Quick view: handler theme.js 9103; `snippets/modal-quick-view.liquid`; `templates/product.quick-view.json`.
- Cart: `theme.AddItemToCart` 6340 / `theme.Cart` 5030; `snippets/{cart-drawer,cart-items}.liquid`; `templates/cart.{drawer,ajax}.liquid`.
- Card swatches: `theme.ProductItemSwatches` 6409.
- Misc sliders: `theme.AnnouncementBar` 5505, `theme.LogoBar` 5560, `theme.HomepageAccordion` 5595.

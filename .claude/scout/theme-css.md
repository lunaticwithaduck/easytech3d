# SCOUT REPORT: theme-css — easytech3d.com STYLE source of truth

Extracted verbatim from the real Shopify theme CSS. Use these EXACT values. Do NOT guess.

Source files (all under `c:/Users/lyubomir.pacheliev_o/Downloads/theme/assets/`):
- `core.css` (79KB, minified) — base reset, typography, grid system, buttons, forms, page-width, sections
- `theme.css` (250KB) — components: header, buttons (override), product card, product label, swatches, collection grid, footer, slideshow, testimonials, etc.
- `collection-page.css` (17KB) — filters sidebar, toolbar, layout buttons, price range
- `cart-page.css` (7.6KB) — cart table, blocks, quantity selector
- `component-rating.css` (1.1KB) — star rating

---

## 1. :root CSS VARIABLES (confirmed — Liquid-injected, define these as the design tokens)

```
--color-text:                #232323   (body text, links default)
--color-body / bg:           #f4f4f4   (page background)
--color-body-text:           #232323-ish (paragraph color; var --color-body-text)
--white-color:               #ffffff
--color-btn-primary:         #ff1b5c   (primary buttons, accents, active states, links:hover)
--color-btn-primary-focus:   #e70042   (primary hover/darker)
--color-btn-primary-text:    #ffffff
--color-btn-secondary:       #3a3a3a
--color-btn-secondary-focus: (darker of #3a3a3a)
--product_label_sale_color / --color-sale: #EA0606
--color-border:              #ebebeb
--color-border-form:         (form border, light gray)
--font-size-base:            16   (unitless; used as `calc(var(--font-size-base) * 1px)`)
--font-stack-header / body:  "Instrument Sans"   (header 700, body 400)
--font-stack-navigation:     "Archivo Narrow" 400
--heading-line-height:       1.2
```

Heading desktop/mobile px (confirmed): h1 80/56 · h2 52/40 · h3 40/26 · h4 22/19 · h5 18/18 · h6 16/14 · base 16.
Letter-spacing: h1/h2 = 2px · h3/h4 = 1px · h5/h6 = 0.5px.

> NOTE: `theme.css` does NOT contain `:root{...}` — the variables are injected inline by Liquid `settings`. The px values above are the ground truth confirmed in the brief. Build a Tailwind token layer from them.

---

## 2. TYPOGRAPHY (core.css)

Base body (core.css):
```css
body, button {
  font-size: 16px;                /* calc(var(--font-size-base)*1px) */
  font-family: "Instrument Sans"; /* var(--font-stack-body) */
  font-weight: 400;
  line-height: 1.5;
  color: #232323;
  background-color: #f4f4f4;
}
p { margin: 0 0 19.44444px; color: var(--color-body-text); }
b, strong { font-weight: var(--font-weight-body--bolder); }  /* ~700 */
a { color: #232323; text-decoration: none; }
a:hover { color: #ff1b5c; }
```

Headings (core.css). Note the calc multipliers — they slightly scale the raw px token:
```css
h1,.h1 { margin:0 0 17.5px; font-family:"Instrument Sans"; font-weight:700; line-height:1.2;
          font-size: calc((80/16)*1em);  letter-spacing:2px; text-transform:none; }   /* = 5em = 80px @16 base */
h2,.h2 { margin:0 0 17.5px; font-size: calc((52/16)*0.9em); letter-spacing:2px; }       /* = 2.925em ≈ 46.8px */
h3,.h3 { margin:0 0 17.5px; font-size: calc((40/16)*0.8em); letter-spacing:1px; }       /* = 2em = 32px */
h4,.h4 { font-size: calc((22/16)*1em);  letter-spacing:1px; }                            /* = 1.375em = 22px */
h5,.h5 { font-size: calc((18/16)*1em);  letter-spacing:0.5px; }                          /* = 1.125em = 18px */
h6,.h6 { font-size: calc((16/16)*1em);  letter-spacing:0.5px; }                          /* = 1em = 16px */
h3-h6 also: font-family:"Instrument Sans"; font-weight:700; line-height:1.2; overflow-wrap:break-word;
```

Mobile (`@media max-width:749px`):
```css
h1,.h1 { font-size: calc((56/16)*0.9em); }   /* ≈ 3.15em ≈ 50.4px */
h2,.h2 { font-size: calc((40/16)*1em); }     /* = 2.5em = 40px */
h3,.h3 { font-size: calc((26/16)*0.8em); }   /* = 1.3em ≈ 20.8px */
h4,.h4 { font-size: calc((19/16)*1em); }     /* = 19px */
h5,.h5 { font-size: calc((18/16)*1em); }     /* = 18px */
h6,.h6 { font-size: calc((14/16)*1em); }     /* = 14px */
p     { font-size: calc((15/16)*1em); }      /* ≈ 15px */
```

Tablet (`@media 750–1199px`): body font-size `*0.9px` (≈14.4px); h1 `(80/16)*0.9em`, h2 `(52/16)*0.9em`, h4 `(22/16)*0.9em`.

**Tailwind-ready heading scale (desktop / mobile):**
| tag | desktop | mobile | weight | letter-spacing |
|-----|---------|--------|--------|----------------|
| h1  | 80px    | ~50px  | 700    | 2px |
| h2  | ~47px (52*0.9) | 40px | 700 | 2px |
| h3  | 32px (40*0.8) | ~21px (26*0.8) | 700 | 1px |
| h4  | 22px    | 19px   | 700    | 1px |
| h5  | 18px    | 18px   | 700    | 0.5px |
| h6  | 16px    | 14px   | 700    | 0.5px |
| body| 16px    | ~15px  | 400    | — (lh 1.5) |

Other:
- `blockquote` 18px, centered, padding 0 30px. `.rte blockquote` border 1px top/bottom, padding 30px 0.
- `.fine-print` 14px italic. `.mega-title--large` = `(--font-size-header + 20)/16 * 1em`.
- `.list-view-item__title` 18px (`(base+2)/16`), header font, header weight.

---

## 3. GRID SYSTEM + BREAKPOINTS (core.css)

**Breakpoints (exact):**
- mobile: `max-width: 480px` (`.mobile--*` classes)
- small/phone: `max-width: 749px` (`.small--*`)  ← primary mobile cutoff
- tablet: `min-width: 750px and max-width: 1199px` (`.tablet--*`)
- medium-up: `min-width: 750px` (`.medium-up--*`)
- desk: `min-width: 1200px and max-width: 1650px` (`.desk--*`)
- (everything ≥1651px = widest)

**Grid (flexbox, NOT CSS grid for product layout):**
```css
.grid { display:flex; flex-wrap:wrap; align-items:flex-start; list-style:none;
        margin: 0 0 0 -11px; padding: 0; }      /* -11px left to offset gutter */
.grid__item { width:100%; padding-left: 11px; } /* 11px gutter desktop */
@media (max-width:749px){
  .grid { margin-left: -22px; }
  .grid__item { padding-left: 22px; }            /* 22px gutter mobile */
}
.grid--uniform .grid__item { margin-bottom: 20px; }
.grid--no-gutters { margin-left:0; } .grid--no-gutters .grid__item { padding-left:0; }
.grid--half-gutters { margin-left:-15px; } .grid--half-gutters>.grid__item { padding-left:15px; }
```

Fractional width classes (responsive-prefixed): `.one-half`=50%, `.one-third`=33.333%, `.one-quarter`=25%, `.one-fifth`=20%, `.one-sixth`=16.667%, `.two-thirds`=66.667%, `.three-quarters`=75%, `.one-twelfth`=8.333% … full 12-col + tenths + eighths set. Prefixes: `.small--`, `.medium-up--`, `.tablet--`, `.desk--`, `.mobile--`. Also `--push-*` (left offsets).

So a 4-up product grid = `.grid__item .medium-up--one-quarter .small--one-half`. Gutter is 11px desktop / 22px mobile (effective gap between cards). Product cards add `.product-item-block { margin-bottom: 30px; }`.

---

## 4. CONTAINERS / PAGE WIDTH / SECTION PADDING (core.css)

```css
.page-width       { max-width: 1660px; margin: 0 auto; padding: 0 55px; }
.page-width-small { max-width: 1280px; margin: 0 auto; padding: 0 55px; }
.section-header   { margin-bottom: 35px; }            /* desktop @min-750: 55px */
@media (min-width:750px){ .section-header { margin-bottom: 55px; } }
.index-section, .padding-section { padding-top:0; padding-bottom: 35px; }
.index-section:first-child { padding-top:0; border-top:0; }
.template-index .index-section:first-child:not(.index-section--slideshow){ margin-top:35px; }
@media(min-width:750px){ ...:not(.index-section--slideshow){ margin-top:55px; } }
hr { margin: 55px 0; border-bottom:1px solid #ebebeb; }
.empty-page-content { padding: 125px 0; }
```

**Tailwind:** container max-w 1660px (`page-width`) / 1280px (`page-width-small`); horizontal padding `px-[55px]`; section vertical rhythm `pb-[35px]` (mobile) → effectively sections separated ~35px, section header bottom margin 35px→55px.

---

## 5. BUTTONS — `.btn` (theme.css overrides core.css; theme wins)

Core base (`core.css`):
```css
.btn {
  appearance:none; width:auto; text-decoration:none; text-align:center; vertical-align:middle;
  cursor:pointer; border:1px solid transparent; white-space:normal;
  font-family:"Instrument Sans"; font-weight:700; font-style:normal; letter-spacing:0;
  font-size: 1em;                                  /* = 16px */
  transition: color .3s, background .3s, opacity .3s, border .3s;
  background-color: #ff1b5c;  color: #ffffff;      /* primary by default */
}
@media(min-width:750px){ .btn { padding: 10px 18px; } }   /* overridden by theme.css below */
.btn:focus, .btn:not([disabled]):hover { color:#ffffff; background-color:#e70042; }  /* primary-focus */
.btn[disabled],.btn[aria-disabled]{ cursor:default; opacity:.5; }
@media(max-width:480px){ .btn { width:100%; } }
```

**theme.css override (USE THESE):**
```css
.btn, .shopify-payment-button__button--unbranded {
  border-radius: 50px;                 /* fully pill */
  padding: 13px 20px 13px 23px;        /* T13 R20 B13 L23 — asymmetric, slightly more left */
  line-height: 1.4;
  display: inline-flex; align-items:center; justify-content: space-between;
  text-transform: none;
  position: relative;
}
.btn span + svg { margin-left:15px; display:inline-block; }
@media(min-width:750px) and (max-width:989px){ .btn { padding:13px; } .btn svg{ width:15px;height:15px;margin-left:15px; } }
.btn--align-center { justify-content:center; }
```

**Hover = expanding pseudo-fill** (not a simple bg swap):
```css
.btn:after { content:""; position:absolute; border-radius:50px; height:0; width:0; left:50%; top:50%; transition:all .3s; }
.btn:not([disabled]):hover:after { height:calc(100% + 2px); width:calc(100% + 2px); left:-1px; top:-1px; }
.btn * { position:relative; z-index:1; }
.btn--primary:after  { background:#e70042; }   /* primary-focus */
.btn--primary:not([disabled]):hover { background-color:#ff1b5c; }   /* base stays, :after grows darker */
```
> For a faithful but simpler port: primary button = bg `#ff1b5c`, text `#fff`, hover bg `#e70042`. The `:after` is just the animated reveal of the darker shade.

Variants:
```css
.btn--primary    { bg #ff1b5c; text #fff; }
.btn--secondary  { background:#3a3a3a; color:var(--color-small-button-text-border); border-color:#3a3a3a; }
                   hover → background: var(--color-btn-secondary-focus);
.btn--white      { color:#232323; background:#fff; border:1px solid transparent; }
.btn--transparent_primary   { background:transparent; color:#ff1b5c; border-color:#ff1b5c; }
                              hover → color:#fff (border stays #ff1b5c)
.btn--transparent_secondary { background:transparent; color:#3a3a3a; border-color:#3a3a3a; }
                              hover → background:#3a3a3a; color: small-button-text-border;
.btn--tertiary   { transparent; color+border = small-button-text-border; }
.btn--small      { padding:8px 10px; font-size: calc((12/16)*1em)=12px; line-height:1; }
.btn--narrow     { padding-left:15px; padding-right:15px; }
.btn--small-wide { (mobile) padding-left:50px; padding-right:50px; }
.btn--link       { background:transparent; border:0; color:#232323; text-align:left; }
.btn--has-icon-after .icon { margin-left:10px; }  .btn--has-icon-before .icon { margin-right:10px; }
```

`.product-form__cart-submit` (add-to-cart): uses `.btn`/`.btn--primary` → pill, padding 13px 20px 13px 23px, radius 50px, bg #ff1b5c. On product form, min-height enforced: `.product-form input/select/textarea/.disclosure__toggle { min-height:44px; }`. In list view max-width 400px; in payment-button row width 50% (with `.shopify-payment-button`). `.product-form__cart-submit.added svg { display:none; }`.

Circle/arrow buttons (sliders): `.slider_custom_arrows .btn` = 44×44px, `border-radius:50%`, bg #fff, color #8d8d8d, hover bg #ff1b5c + color #fff. Logo-bar arrows 55×55px. Back-to-top 47×47px circle.

---

## 6. SECTION / INDEX HEADERS — `.section-header` + eyebrow `.h5` + `.section-header__title`

`.section-header` margin-bottom 35px (≥750px: 55px). The **eyebrow/subtitle** is an `.h5`/`h5` inside `.section-header`:
```css
.section-header .h5, .section-header h5 {
  font-size: calc(var(--font-size-base)*1px - 2px);   /* = 14px */
  text-transform: uppercase;
  position: relative; display: inline-flex; align-items: center;
}
.section-header .h5:before {            /* the little dash before the eyebrow */
  content:" "; height:2px; width:25px; margin-right:7px; display:block; color:inherit;
}
.heading_block.section-header .h5:before { background: #232323; }       /* default dash = text color */
/* subtitle color style modifiers: */
.homepage_subtitle_style_primary  .h5      { color:#ff1b5c; }  :before{ background:#ff1b5c; }
.homepage_subtitle_style_secondary .h5     { color:#3a3a3a; }  :before{ background:#3a3a3a; }
.homepage_subtitle_style_match_header h5   { color:#232323; }  :before{ background:#232323; }
```
The **title** is a normal `h2`/`.h2` (≈47px desktop / 40px mobile, weight 700, letter-spacing 2px). Default title `text-transform:none`, `letter-spacing` per heading var. Eyebrow sits above the title; eyebrow has the 25px×2px dash prefix.

> Build pattern: `<div class="section-header"><h5 class="eyebrow">EYEBROW</h5><h2>Title</h2></div>` — eyebrow = 14px, uppercase, inline-flex, with a 25px wide / 2px tall colored bar 7px to its left (color #ff1b5c when primary style, else #232323).

Featured-collections tab nav titles: `.index-tabs_nav--item h3` uppercase, `font-size: calc((--font-size-header)/16 * 0.5em)`, inactive opacity 0.5, active opacity 1 with a 4px `#ff1b5c` underline bar (`:after`, width calc(100%+20px), bottom -13px). Tab nav items `margin-right:90px`.

---

## 7. PRODUCT CARD — `.product-card` / `.product-item-block` (theme.css)

```css
.product-card {
  padding: 20px;
  border-radius: 20px;
  background: #ffffff;
  position: relative;
  height: 100%;
  display: flex; flex-direction: column;
  transition: all .3s;
}
.product-item-block { margin-bottom: 30px; }
.product-card .product-item__action-list .btn { margin-bottom:0; margin-top:10px; }
.product-card .product-item__action-list, form.product-item__action-list { margin-top:auto; } /* pins CTA to bottom */
```

**Image:**
```css
.product-card__image-wrapper { width:100%; margin:0 auto; display:block; }
/* fixed-height image mode (use_align_height): */
.use_align_height .product-card .product-card__image-with-placeholder-wrapper {
  height:auto !important; min-height/max-height: var(--product-image-height) !important; margin-bottom:15px;
}
.use_align_height .product-card img { object-fit:contain; max-height:var(--product-image-height); width:100%; }
/* cover-fill image mode (use_image_height): */
.use_image_height .product-item-block .product-card__image { object-fit:cover; height:100%; width:100%; display:block; }
.use_image_height .product-item-block.view-mode-grid .product-card__image { margin-bottom:10px; }
/* alternate (hover) image, desktop ≥750px swaps on hover: */
.product-card__image--alternate { position:absolute; top:0; left:0; right:0; margin:0 auto; opacity:0; object-fit:cover; object-position:center; }
@media(min-width:750px){
  .product-item-block--withAlternateImage .product-card__image-wrapper:hover .product-card__image--alternate { opacity:1; }
  ...:hover .product-card__image:not(.--alternate){ opacity:0; visibility:hidden; }
}
```
> No fixed aspect-ratio token — image height is driven by theme setting `--product-image-height`. Default behavior: `object-fit:contain` (align-height mode) or `object-fit:cover` (image-height mode). For the port, use a fixed product image box (e.g. square or the theme's configured height) with `object-fit:contain` and 15px bottom margin, white card bg.

**Title:** there is NO `.product-card__title` rule — title is rendered with heading classes (`.h5`/`.h6` ≈ 16-18px, weight 700). `.grid-view-item__title { color:#232323; margin-bottom:0; }`, `.grid-view-item__meta { margin-top:8px; }`.

**Price + reviews row:**
```css
.product-item__price_and_reviews_row { display:flex; align-items:center; justify-content:space-between;
  margin: 20px 0 10px 0; flex-wrap:wrap; }
.product-item__price_and_reviews_row .price { font-weight:bold; margin-bottom:5px; }
.price-item--sale { margin-right:10px; }   /* sale price sits left of struck regular price */
```
`.price` itself = bold; sale color comes from `--color-sale #EA0606` / product-label. `body.hide_prices .price { display:none; }`.

**List view** (`.product-item-block.view-mode-list`): row flex; media 30% width, info 70% with `padding-left:50px`; submit/quick-view max-width 400px. Mobile (≤749px): stacks to column, full width.

---

## 8. COLOR SWATCHES — `.product-item__swatches` (top-right of card)

```css
.product-item__swatches { position:absolute; top:20px; right:20px; display:flex; }
.product-item__swatches .color-swatch-list { display:flex; flex-direction:column; align-items:center; }
.color-swatch { position:relative; display:inline-block; margin:6px; vertical-align:middle; }
.color-swatch__radio { position:absolute; height:0; width:0; opacity:0; }
.color-swatch__item {
  display:block; width:18px; height:18px; border-radius:50%; cursor:pointer;
  background-position:center; background-repeat:no-repeat; background-size:contain;
}
.color-swatch__item:after {   /* selectable ring */
  content:""; position:absolute; top:-5px; left:-5px;
  width:calc(100% + 10px); height:calc(100% + 10px);
  border-radius:50%; border:2px solid #eee;
}
.color-swatch__radio:checked + .color-swatch__item:after { border-color:#ff1b5c; }
.color-swatch--white .color-swatch__item { box-shadow:0 0 0 1px var(--color-border-form) inset; }
.color-swatch__item-link { /* "view more" pill */ display:none; height:18px; padding:0 8px; background:#fff;
  box-shadow:0 0 0 1px #d4d6d8 inset; border-radius:10px; line-height:18px; font-size:12px; }
.color-swatch--view-more .color-swatch__item-link { display:block; }
.color-swatch--view-more .color-swatch__item { display:none; }
```
> Swatch = 18px circle, 6px margin, 2px selection ring offset 5px (gray `#eee`, active `#ff1b5c`). Stacked vertically, top-right corner of card.

---

## 9. PRODUCT LABELS — sale / sold-out / custom (theme.css)

```css
.product-item__label-list { position:absolute; z-index:1; top:20px; left:20px; }   /* top-left of card */
.product-label {
  display:inline-block; padding:5px 15px; border-radius:20px;
  font-size:13px; line-height:1; text-align:center;
  width:max-content; min-width:90px;
  color:#ffffff;                 /* base */
  background:#ffffff; border:2px solid transparent;
}
.product-label--on-sale  { border-color:#EA0606; color:#EA0606; }      /* var --product_label_sale_color */
.product-label--soldout  { border-color:var(--product_label_sold_out_color); color: same; }
.product-label--custom1  { color+border: var(--product_label_1_color); }
.product-label--custom2  { color+border: var(--product_label_2_color); }
.product-label + .product-label { margin-left:5px; }
```
> Labels are **outlined pills** (white bg, 2px colored border, colored text) — NOT solid. Sale = `#EA0606` outline+text. Radius 20px, padding 5px 15px, font 13px, min-width 90px, positioned top-left (top:20px left:20px) inside the card.

---

## 10. FORMS / INPUTS (core.css + theme.css)

```css
input, textarea, select, .disclosure__toggle {
  font-size:16px; font-family:"Instrument Sans"; font-weight:400; color:#232323;
  border:1px solid var(--color-border-form);
  background-color: var(--color-text-field);
  border-radius: 2px; line-height:1.2; max-width:100%;
}
input, textarea { padding: 8px 15px; }
@media(min-width:750px){ input, textarea { padding: 10px 18px; } }
textarea { min-height:100px; }
:focus { border-color: var(--color-border-form-darker); }
[disabled] { background:#f4f4f4; border-color:#f4f4f4; cursor:default; }
.label--hidden / .visually-hidden { clip-hidden. }
.input--error { border-color:#d20000; background:#fff8f8; color:#d20000; }
.form-message--success { border:1px solid #1f873d; background:#f8fff9; color:#1f873d; }
.form-message--error   { color:#651818; border:1px solid #d20000; background:#fff8f8; padding:1rem 1.3rem; }
```
Select: native arrow removed, custom `background-image: var(--svg-select-icon)` at `right 10px center`; header selects use `secondary_nav_color_text`.

**Pill / rounded form variants** (theme-specific, used in cart/footer/search):
```css
.Form__Select select, .Form__Input { border:0; border-radius:20px; padding:16px 30px; font-size:14px;
  background-color: var(--color-blankstate-background); width:100%; }
/* footer newsletter input */: border-radius:50px; padding:15px 15px 15px 30px; border:1px solid #ebebeb; color:#fff.
/* footer newsletter submit */: 49×49px circle, svg 20px.
/* header search input */: border-radius:50px; min-height:55px; color:#232323; font-size:16px; border:0; min-width:138px.
/* cart note input */: border-radius:20px; padding:20px 25px; font-size:14px; min-height:105px; bg var(--color-body).
.input-group__field input { min-height:42px; width:100%; }
```

**Input-group** (newsletter etc.): `display:flex; flex-wrap:wrap; justify-content:center; width:100%`. `.input-group--nowrap{flex-wrap:nowrap}`. Connected fields zero right radius.

---

## 11. RADII / SHADOWS / MISC GLOBAL TOKENS

| Token | Value | Where |
|-------|-------|-------|
| Button radius | `50px` (pill) | `.btn` |
| Card radius (product/collection) | `20px` | `.product-card`, `.collection-grid-item` |
| Small media / image radius | `10px` | blog cards, mosaic, logo tiles, dropdowns |
| Input radius (default) | `2px` | core inputs |
| Input radius (pill forms) | `20px` / `50px` | cart, search, footer |
| Label radius | `20px` | `.product-label` |
| Cart table / cart block radius | `20px` | `.Cart__ItemList`, `.cart__block` |
| Swatch | `50%` (circle, 18px) | `.color-swatch__item` |
| Circle slider arrows | `50%`, 44px | `.slider_custom_arrows .btn` |
| Soft card shadow | `box-shadow: 0 0 4px 2px var(--color-border)` (#ebebeb) | logo tiles, icon circles |
| Layout-button selected | `box-shadow: 0 2px 3px 1px var(--color-border)` | collection layout toggle |
| Slider dots | 65px × 4px, radius 20px, inactive `#e4e4e4`/`#ebebeb`, active `#ff1b5c` | slideshow / flickity |
| Gutter (grid) | 11px desktop / 22px mobile | `.grid__item` |
| Card bottom spacing | 30px | `.product-item-block` |
| Grid item bottom (uniform) | 20px | `.grid--uniform .grid__item` |

Text colors: text `#232323`, links hover `#ff1b5c`, paragraph `--color-body-text`, muted `opacity:0.6` (used on testimonials, block content), gray UI `#8d8d8d`, dividers `#ccc`/`#e0e0e0` in cart, borders `#ebebeb`.

---

## 12. SITE HEADER / NAV (theme.css)

```css
#shopify-section-header { position:absolute; top:var(--announcement-bar-height); left:0; width:100%; z-index:9; padding:0; }
.site-header { padding:0; background:transparent; z-index:1; }            /* transparent, overlays hero */
.site-header .header_top, .header_top__row { display:flex; align-items:center; flex-wrap:wrap; padding:13px 20px; }
.site-header__mobile-nav { padding:20px; align-items:center; }
.top_navigation_links { display:flex; align-items:center; font-size:12px; font-weight:600; }
.top_navigation_links .icon { width:12px; height:12px; }
.top_navigation_menu li a { display:block; padding:3px 10px; font-size:12px; }
```
Nav font = "Archivo Narrow" 400 (`--font-stack-navigation`), `--font-size-navigation`. Header is **transparent and absolutely positioned over the slideshow** (body not `.no-overlap-header`); slideshow gets top padding `calc(var(--header-height)+10px)`.

Header search bar: pill interior, max-width 515px, `border-radius:50px`, bg #fff, `padding:0 0 0 10px`; input min-height 55px, font 16px, color #232323; submit svg color `#ff1b5c`. Hidden on mobile (≤749px).

Dropdowns: `.site-nav__dropdown` bg `--color-bg`, border 1px `#ebebeb`; `.small_dropdown` max-width 225px radius 10px; mega menu `.second_lvl.nav-dropdown` min-width 760px, padding 16px, radius 20px. Dropdown links `padding:9px 30px; font-size:14px; border-radius:50px;` hover color `#ff1b5c`.

Mobile nav: off-canvas from right (`right:-999px` → `right:0`), full width, `height:100vh`, overlay `rgba(46,45,43,.8)`.

Social icons (footer): 49×49px circle, bg `#2b2b2b`, hover bg `#ff1b5c`. Icons 23px (25px ≥750px).

---

## 13. COLLECTION PAGE (collection-page.css)

- `.collection-sidebar` max-width 300px, `margin-right:95px`, padding `20px 25px 20px 0`. <1200px becomes fixed off-canvas drawer 400px from right (`transform:translateX(400px)` → `.show` translateX(0)), padding 30px.
- `.category-filters-area-section` padding `30px 0`, border-bottom `2px solid #ebebeb`.
- `.toolbar_sort_by-block` flex, min-width 205px, `border-radius:50px`, `border:2px solid #ebebeb`, padding `12px 15px`, font 14px (`base-2`).
- `.collection__layout-button` (grid/list toggle) = 49×49px circle, `border:2px solid #ebebeb`, `margin-right:15px`; selected → bg #fff, border transparent, `box-shadow:0 2px 3px 1px #ebebeb`.
- `.filters-toolbar__product-count` font 16px, color `#888`, margin-left 15px.
- `.active-filters__clear.btn` padding `6px 15px`, font `1em-2px`, icon 10px.
- Price range slider: track height 10px bg `#e0e0e0` radius 20px; thumb 16px circle bg `#ff1b5c`. Price inputs 90px wide, centered.
- `.collection-image-container` margin-bottom 50px, image object-fit cover.
- `.show_more_options` color `#ff1b5c`, border-bottom 1px `#ff1b5c`.
- Color filter swatch: 18px circle, border `#ddd`, checkmark via `check.png` cdn image, active shows check.
- `#AjaxinatePagination .btn` width:auto, margin 20px 0.

---

## 14. CART PAGE (cart-page.css)

- `.Cart__ItemList` = `display:table`, `border-radius:20px; overflow:hidden`. Head row bg `#e0e0e0`, head cells padding 15px (first 30px left, last 30px right).
- `.CartItem` rows bg #fff; cells padding `30px 15px`, border-bottom `1px solid #ccc`. Main info cell padding-left 30px, width 500px.
- Image wrapper 120px wide.
- `.QuantitySelector` bg `--color-body`, `border-radius:50px`, width 120px, padding `9px 15px`; current qty font-weight 600, font 18px. Mobile width 110px, padding 6px 10px.
- `form.Cart` = flex; content side width 100%; sidebar max-width 370px, margin-left 11px. <1200px stacks column.
- `.cart__block` radius 20px overflow hidden; title bg `#e0e0e0` padding `15px 30px`; content padding 20px bg #fff.
- `.cart-note__input` min-height 105px, bg `--color-body`, radius 20px, padding `20px 25px`, font 14px, no border, resize none.
- `.cart-subtotal` / `.ShippingEstimator` padding `20px 30px` bg #fff, border-bottom `1px solid #ccc`.
- `.cart__buttons-container` max-width 330px centered. `.cart__submit` width 100%.
- Mobile (≤749px): table collapses, `.CartItemMobile` shows as flex card, padding `20px 15px 25px`, border-bottom `1px solid #ccc`.

---

## 15. STAR RATING (component-rating.css)

```css
.rating { display:inline-block; margin:0; }
.rating-star {
  --percent: calc((var(--rating)/var(--rating-max) + var(--rating-decimal)*var(--font-size)/(var(--rating-max)*(var(--letter-spacing)+var(--font-size)))) * 100%);
  letter-spacing: calc(var(--letter-spacing)*1rem);
  font-size: calc(var(--font-size)*1rem);
  line-height:1; display:inline-block;
}
.rating-star:before {
  content:'★★★★★';
  background: linear-gradient(90deg, #ff1b5c var(--percent), var(--rating-star-bg) var(--percent));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.rating-text { display:none; }
.rating-count { display:inline-block; margin:0; }
@media (forced-colors:active){ .rating{display:none} .rating-text{display:block} }
```
> 5-star glyphs (★★★★★) with a horizontal gradient fill: filled portion = `#ff1b5c`, empty = `--rating-star-bg`. Driven by `--rating`, `--rating-max`, `--rating-decimal`, `--font-size`, `--letter-spacing` custom props.

---

## 16. COLLECTION GRID ITEM (theme.css)

```css
.collection-grid-item { background:#fff; padding:30px; border-radius:20px; position:relative; text-align:center; }
@media(max-width:749px){ .collection-grid-item { padding:20px 15px; } }
.collection-grid-item img { display:block; height:auto; margin:0 auto; }
.collection-grid-item__button_wrapper { margin-top:50px; } (mobile 20px)
.collection-grid-item__button_wrapper .btn { width:100%; }
.collection-grid-item.full_image { padding:0; }
.collection-grid-item.full_image img { border-radius:20px 20px 0 0; }
.collection-grid-item-products-count { margin-top:10px; }
```

---

## 17. KEY TAILWIND CONFIG STARTER (translate tokens)

```js
colors: {
  text:        '#232323',
  body:        '#f4f4f4',
  primary:     '#ff1b5c',
  'primary-dark':'#e70042',
  secondary:   '#3a3a3a',
  sale:        '#EA0606',
  border:      '#ebebeb',
  white:       '#ffffff',
  muted:       '#8d8d8d',
},
fontFamily: {
  heading: ['"Instrument Sans"', 'sans-serif'],   // 700
  body:    ['"Instrument Sans"', 'sans-serif'],   // 400
  nav:     ['"Archivo Narrow"', 'sans-serif'],    // 400
},
borderRadius: { btn:'50px', card:'20px', media:'10px', input:'2px', pill:'50px', label:'20px' },
maxWidth: { page:'1660px', 'page-small':'1280px' },
spacing:  { 'page-x':'55px', gutter:'11px', 'gutter-m':'22px' },
fontSize: {
  h1:['80px',{lineHeight:'1.2',letterSpacing:'2px',fontWeight:'700'}],
  h2:['47px',{lineHeight:'1.2',letterSpacing:'2px',fontWeight:'700'}],
  h3:['32px',{lineHeight:'1.2',letterSpacing:'1px',fontWeight:'700'}],
  h4:['22px',{lineHeight:'1.2',letterSpacing:'1px',fontWeight:'700'}],
  h5:['18px',{lineHeight:'1.2',letterSpacing:'0.5px',fontWeight:'700'}],
  h6:['16px',{lineHeight:'1.2',letterSpacing:'0.5px',fontWeight:'700'}],
  eyebrow:['14px',{textTransform:'uppercase'}],
},
screens: { sm:'480px', phone:'749px', tablet:'750px', desk:'1200px', wide:'1651px' },
```
Breakpoints in the theme are MAX-width driven for mobile (`max-width:749px` is the main mobile cutoff) and MIN-width for desktop (`min-width:750px`). Mirror with `max-[749px]:` / `min-[750px]:` utilities or custom screens.

---

## 18. BACKGROUND COPY / TEXT FOUND IN CSS (literal content strings)

- Testimonial quote mark: `content:"\201C"` (a giant “ curly quote), 100px, color `#ff1b5c`, positioned over author image.
- Sidebar accordion toggles: `content:"+"` (collapsed) / `content:"-"` (expanded), 20px circle, border `#ebebeb` → active `#ff1b5c`.
- Star rating glyphs: `content:'★★★★★'`.
- Blockquote cite prefix: `content:"\2014 \0020"` (em-dash + space).
- Color-filter checkmark image: `https://cdn.shopify.com/s/files/1/2131/2043/files/check.png?v=1620308851`.
- (No marketing/headline body copy lives in CSS — that comes from templates/sections. This scout is CSS-only.)

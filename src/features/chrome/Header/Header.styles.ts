import { cva } from 'class-variance-authority';

// EXACT theme `.site-header` reproduction. The live theme renders a solid-white header bar that the
// rebuild pins sticky below the (non-sticky) announcement bar. Real classes/values from theme.css
// `.site-header.logo--inline`, `.header_top__row{padding:13px 20px → custom_css 5px}`,
// `.site-header__mobile-nav{padding:20px}`. Arbitrary px live here (R4 exempts *.styles.ts).

// Outer wrapper = `#shopify-section-header`: solid white, sticky at top (announcement bar scrolls
// away above it). z above page content. Bottom hairline = `--color-border` (#ebebeb).
export const headerVariants = cva('sticky top-0 z-40 w-full border-b border-border bg-surface');

// `.page-width` = max-width:1660px; margin:0 auto; padding:0 55px (theme container). Mobile shrinks
// the horizontal padding to keep the logo/icons from clipping.
export const pageWidthClass = 'mx-auto w-full max-w-[1660px] px-5 min-[750px]:px-[55px]';

/* -------------------------------------------------------------------------- */
/* TOP UTILITY ROW — `.header_top` (custom_css padding:5px). Right-aligned     */
/* `Моят Акаунт` link, 12px bold (theme `.top_navigation_links{font-size:12px; */
/* font-weight:600}`). Hidden under 750px (it moves into the drawer footer).   */
/* -------------------------------------------------------------------------- */
export const topRowClass = 'hidden border-b border-border py-[5px] min-[750px]:block';
export const topRowInnerClass = 'flex items-center justify-end gap-[10px]';
export const topAccountLinkClass =
  'flex items-center gap-[6px] py-[3px] text-[12px] font-semibold text-text transition-colors hover:text-primary';
// `.top_navigation_links .icon{width:12px;height:12px}`
export const topAccountIconClass = 'block size-[12px] text-primary';

/* -------------------------------------------------------------------------- */
/* MAIN NAV ROW — `.site-header__mobile-nav{padding:20px}` (grid no-gutters).   */
/* logo (left) + horizontal nav + icons cluster (right).                       */
/* -------------------------------------------------------------------------- */
export const mainRowClass = 'flex items-center gap-4 py-5 min-[750px]:gap-6';

// `.logo_element` min-width = logo_max_width (100px). Logo image custom_css: border-radius:20px,
// shifted left:25% on desktop (reset ≤1024px). Never shrinks below the nav/icons.
export const logoWrapClass = 'shrink-0 min-[750px]:min-w-[100px]';
// `.site-header__logo-image` — the anchor wrapping the logo image.
export const logoLinkClass =
  'inline-flex items-center text-[1.375rem] font-bold tracking-tight text-text min-[1025px]:translate-x-1/4';
// Logo image radius 20px (custom_css `img{border-radius:20px}`), capped at logo_max_width 100px.
export const logoImageClass = 'block h-auto w-full max-w-[100px] rounded-[20px]';
// Styled-text wordmark fallback (logo image style is fine per brief).
export const wordmarkClass =
  'inline-flex items-center rounded-[20px] bg-primary px-3 py-2 text-[1.125rem] font-bold leading-none text-inverse';

/* -------------------------------------------------------------------------- */
/* ICONS CLUSTER — `.site-header__icons-wrapper`. Pink search pill + pink cart  */
/* circle + account icon + locale switch + hamburger (mobile only).            */
/* -------------------------------------------------------------------------- */
// Right-aligned, fills remaining row width; the search pill grows (max-w 515px).
export const iconsWrapClass = 'ml-auto flex items-center gap-[10px]';

// Account icon link — circular, theme `account` glyph. On desktop it lives in the top utility row,
// but a compact circular variant sits in the icons cluster for the search row at ≥750px.
export const accountIconLinkClass =
  'hidden size-[55px] items-center justify-center rounded-full text-text transition-colors hover:text-primary min-[750px]:inline-flex';
export const accountIconGlyphClass = 'block size-[22px]';

/* -------------------------------------------------------------------------- */
/* CART — `.header_cart_info .cart_icon.btn.btn--primary`: pink circle button.  */
/* custom_css forces `.cart_icon` bg #ff1b5c / color #fff. Circle 55×55.        */
/* -------------------------------------------------------------------------- */
export const cartLinkClass =
  'relative inline-flex size-[55px] shrink-0 items-center justify-center rounded-full bg-primary text-inverse transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface';
export const cartIconClass = 'block size-[22px]';
// `.header_cart_count` count badge, anchored top-right of the circle.
export const cartBadgeClass =
  'absolute -right-[2px] -top-[2px] inline-flex min-w-[18px] items-center justify-center rounded-full bg-text px-[5px] text-[11px] font-bold leading-[16px] text-inverse';

import { cva } from 'class-variance-authority';

// EXACT theme mobile drawer reproduction (`.mobile-nav-wrapper #MobileNav`):
//   off-canvas right (`right:-999px → right:0`), full-width, height 100vh, drawer bg #232323,
//   `.mobile-nav__dropdown` bg #1d1d1d. Overlay = rgba(46,45,43,.8). Toggle = pink circle 45px
//   (`.js-mobile-nav-toggle{background:#fff→custom_css #ff1b5c; 45px; radius:50%}`).
// Arbitrary px/colors live here (R4 exempts *.styles.ts).

// Hamburger toggle — pink circle, theme `hamburger` glyph. Visible only < 750px.
export const hamburgerClass =
  'inline-flex size-[45px] shrink-0 items-center justify-center rounded-full bg-primary text-inverse transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface min-[750px]:hidden';
export const hamburgerIconClass = 'block h-[14px] w-[20px]';

// Dimming overlay behind the drawer — rgba(46,45,43,.8).
export const overlayVariants = cva(
  'fixed inset-0 z-40 bg-[rgba(46,45,43,0.8)] transition-opacity duration-300 min-[750px]:hidden',
  {
    variants: {
      open: {
        true: 'opacity-100',
        false: 'pointer-events-none opacity-0',
      },
    },
    defaultVariants: { open: false },
  },
);

// Off-canvas drawer — full-width, 100vh, slides from the right (right:-100% → 0). Dark #232323.
export const drawerVariants = cva(
  'fixed inset-y-0 z-50 flex h-screen w-full flex-col bg-text text-inverse transition-[right] duration-300 ease-[cubic-bezier(0.4,0.01,0.165,0.99)] min-[750px]:hidden',
  {
    variants: {
      open: {
        true: 'right-0',
        false: '-right-full',
      },
    },
    defaultVariants: { open: false },
  },
);

// Drawer top bar — white surface, mirrors the live header row (logo left, pink circles right).
export const drawerHeaderClass = 'flex items-center justify-between bg-surface px-5 py-5';
export const drawerLogoClass =
  'inline-flex items-center rounded-[20px] text-[1.375rem] font-bold text-text';
export const drawerHeaderIconsClass = 'flex items-center gap-[10px]';

// Pink circular control (search / cart / close) in the drawer header.
export const drawerCircleClass =
  'relative inline-flex size-[55px] items-center justify-center rounded-full bg-primary text-inverse transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const drawerCircleIconClass = 'block size-[22px]';
export const drawerCircleSmallIconClass = 'block size-[20px]';
// Cart badge inside the drawer header circle.
export const drawerCartBadgeClass =
  'absolute -right-[2px] -top-[2px] inline-flex min-w-[18px] items-center justify-center rounded-full bg-text px-[5px] text-[11px] font-bold leading-[16px] text-inverse';

// `#MobileNav` — scrollable nav list.
export const drawerNavClass = 'flex-1 overflow-y-auto py-2';

// `.mobile-nav-footer` — centered, account pill at the bottom.
export const drawerFooterClass = 'mt-[10px] px-[30px] pb-[15px] pt-[10px] text-center';
// `.mobile-nav-footer-block{background:#1d1d1d; border-radius:20px; padding:10px 20px; 14px}`.
export const drawerAccountClass =
  'inline-flex items-center gap-[8px] rounded-[20px] bg-[#1d1d1d] px-[20px] py-[10px] text-[14px] text-muted transition-colors hover:text-inverse';
export const drawerAccountIconClass = 'block size-[15px] text-primary';

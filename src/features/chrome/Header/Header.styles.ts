import { cva } from 'class-variance-authority';

// Sticky top bar shell. White surface, subtle bottom hairline, sits above page content.
export const headerVariants = cva('sticky top-0 z-50 w-full border-b border-border bg-background');

// Inner row: wordmark | nav | actions.
export const headerRowClass = 'flex h-16 items-center gap-4 lg:h-20';

// Wordmark stays compact and never shrinks below the nav/actions.
export const wordmarkClass = 'shrink-0 text-xl font-bold tracking-tight lg:text-2xl';

// Desktop nav fills the middle; hidden on small screens (drawer takes over).
export const desktopNavWrapperClass = 'hidden flex-1 lg:block';

// Right-aligned action cluster (search, cart, account, locale, hamburger).
export const actionsClass = 'ml-auto flex items-center gap-1 sm:gap-2 lg:gap-3';

// Circular icon-action surface — primary fill, inverse glyph (matches the live pink buttons).
export const iconActionClass =
  'inline-flex size-10 items-center justify-center rounded-full bg-primary text-inverse transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

// Cart count bubble anchored to the cart icon.
export const cartWrapperClass = 'relative';
export const cartBadgeClass =
  'absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-text px-1.5 text-inverse';

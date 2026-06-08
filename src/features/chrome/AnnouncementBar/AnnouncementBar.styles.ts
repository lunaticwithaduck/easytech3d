import { cva } from 'class-variance-authority';

// Thin full-width promo bar at the very top of the storefront. Dark band (bg-text,
// matching the live capture's near-black bar) with centered, inverse-colored small copy.
export const announcementBarVariants = cva(
  'flex w-full items-center justify-center bg-text px-4 py-1.5 text-center',
);

import { cva } from 'class-variance-authority';

// Dark footer band matching the live capture: near-black surface (bg-text) with inverse copy.
// The brand/blurb column is wider than the menu columns, hence the 2fr lead column on desktop.
export const footerVariants = cva('w-full bg-text');

export const footerTopVariants = cva(
  'grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr]',
);

export const footerBrandVariants = cva('flex flex-col gap-4');

export const footerColumnVariants = cva('flex flex-col gap-4');

export const footerLinkListVariants = cva('flex flex-col gap-2.5');

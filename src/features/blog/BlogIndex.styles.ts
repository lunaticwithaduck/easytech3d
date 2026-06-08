import { cva } from 'class-variance-authority';

// Vertical rhythm for the blog page body beneath the banner — matches the theme's `.index-section`
// padding-bottom (35px → 55px). The grid sits inside a `.page-width` (Container).
export const bodyVariants = cva('py-[35px] md:py-[55px]');

// Article grid — Liquid `blog-template` layout `grid` with item width
// `mobile--one-whole small--one-half medium-up--one-third` → 1-up (phone) / 2-up (small) / 3-up
// (≥750px ≈ md). Gutter ≈ the theme's grid gap; cards add their own 30px bottom rhythm.
export const gridVariants = cva(
  'grid grid--uniform grid-cols-1 gap-x-[11px] gap-y-[30px] sm:grid-cols-2 md:grid-cols-3',
);

// Empty-state wrapper shown when a blog has no articles yet (theme `.empty-page-content`).
export const emptyStateVariants = cva('py-[125px] text-center');

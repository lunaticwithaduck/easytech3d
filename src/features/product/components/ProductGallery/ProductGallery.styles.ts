import { cva } from 'class-variance-authority';

// Sticky on desktop so the gallery trails the buy box as the description scrolls.
export const galleryRootClass = 'flex flex-col gap-4 lg:sticky lg:top-24';

// Main stage: a square, paper-toned well that contains the active image.
export const mainImageWrapClass =
  'relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-paper';

export const mainImageClass = 'object-contain';

// Thumbnail strip below the main image — a wrapping row of small square buttons.
export const thumbStripClass = 'flex flex-wrap gap-3';

// Each thumbnail is a bordered square; the active one gets the brand-primary ring.
export const thumbButtonVariants = cva(
  'relative size-16 shrink-0 overflow-hidden rounded-md border bg-paper transition-colors sm:size-20',
  {
    variants: {
      active: {
        true: 'border-primary ring-2 ring-primary',
        false: 'border-border hover:border-primary',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export const thumbImageClass = 'object-contain';

import { cva } from 'class-variance-authority';

// A collection tile: white panel, centered product image, title + count, then a dark "browse"
// pill at the bottom. Lifts and brand-borders on hover, matching the list-collections cards.
export const cardVariants = cva(
  'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg',
);

// Square media well; image is contained (product photos on a light ground).
export const mediaVariants = cva('relative mb-4 aspect-square w-full overflow-hidden bg-paper');

export const imageVariants = cva(
  'object-contain transition-transform duration-300 group-hover:scale-105',
);

export const titleVariants = cva('line-clamp-2 group-hover:text-primary');

export const infoVariants = cva('flex flex-1 flex-col items-center gap-1');

// The dark rounded "Разгледай" pill with a trailing arrow, anchored to the card foot.
export const pillVariants = cva(
  'mt-4 flex items-center justify-between gap-2 rounded-button bg-backdrop px-4 py-2 text-inverse transition-colors group-hover:bg-primary',
);

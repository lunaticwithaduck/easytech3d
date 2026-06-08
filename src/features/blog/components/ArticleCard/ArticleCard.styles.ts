import { cva } from 'class-variance-authority';

// Article tile mirroring the Liquid `article_block`: a media well on top, then the meta/title/
// excerpt/CTA stack. The whole card is a white panel that lifts on hover like the product grid.
export const cardVariants = cva(
  'group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg',
);

// Landscape media well (the blog grid uses wide cards, unlike the square product cards).
export const mediaVariants = cva('relative aspect-[3/2] w-full overflow-hidden bg-paper');

export const imageVariants = cva(
  'object-cover transition-transform duration-300 group-hover:scale-105',
);

// Title + date + excerpt + CTA stacked beneath the media.
export const infoVariants = cva('flex flex-1 flex-col gap-3 p-5');

export const titleVariants = cva('line-clamp-2 transition-colors group-hover:text-primary');

export const excerptVariants = cva('line-clamp-3');

// Read-more row pinned to the bottom of the card with a small arrow that nudges on hover.
export const readMoreVariants = cva(
  'mt-auto inline-flex items-center gap-1 text-primary transition-transform group-hover:translate-x-1',
);

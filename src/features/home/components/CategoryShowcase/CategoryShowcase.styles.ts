// Centered category showcase: heading, a row of circular collection tiles, then a CTA button.
export const showcaseRootClass = 'flex flex-col items-center gap-10';

// Responsive grid of circular tiles — 2-up on mobile up to 7-up on wide desktop.
export const tileGridClass =
  'grid w-full grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-7';

export const tileClass = 'group flex flex-col items-center gap-3 text-center';

// Circular image frame with a soft surface background.
export const tileImageWrapClass =
  'relative aspect-square w-full overflow-hidden rounded-full bg-elevated';

export const tileImageClass =
  'object-cover transition-transform duration-300 group-hover:scale-105';

export const tileLabelClass = 'leading-snug';

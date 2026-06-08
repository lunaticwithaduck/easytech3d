import { cva } from 'class-variance-authority';

// Outer wrapper positions the arrow controls relative to the scrolling row.
export const carouselRootClass = 'relative';

// Horizontal scroll-snap track. Cards are basis-sized so ~1.2 show on mobile and
// ~4 on desktop; the gutters carry the inter-card gap. Scrollbar hidden — the
// arrows + drag are the affordance.
export const carouselTrackClass =
  'flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

// Each card slot snaps to its start edge. ~1.2 cards on mobile → ~4 on desktop.
export const carouselItemClass =
  'shrink-0 snap-start basis-[83%] sm:basis-[48%] md:basis-[32%] lg:basis-[calc((100%-3rem)/4)]';

// Round icon-only arrow buttons floating over the track edges.
export const carouselArrowVariants = cva(
  'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 rounded-full !p-0 shadow-md md:inline-flex disabled:opacity-0',
  {
    variants: {
      direction: {
        prev: '-left-3',
        next: '-right-3',
      },
    },
  },
);

export type CarouselArrowVariants = Parameters<typeof carouselArrowVariants>[0];

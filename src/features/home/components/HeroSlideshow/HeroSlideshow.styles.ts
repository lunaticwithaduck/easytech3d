import { cva } from 'class-variance-authority';

// Full-bleed hero. On desktop the live theme shows the rotating slideshow; on mobile it hides
// the slideshow (`@media (max-width:750px){.slideshow{display:none}}`) and we render a simpler
// stacked variant instead.

export const heroRootClass = 'relative w-full overflow-hidden';

// Desktop slideshow viewport — hidden below md, where the stacked mobile variant takes over.
export const heroDesktopClass = 'relative hidden h-[32rem] w-full md:block lg:h-[36rem]';

export const heroSlideVariants = cva(
  'absolute inset-0 transition-opacity duration-700 ease-in-out',
  {
    variants: {
      active: {
        true: 'opacity-100',
        false: 'pointer-events-none opacity-0',
      },
    },
    defaultVariants: { active: false },
  },
);

export const heroImageClass = 'object-cover';

// Dark overlay so the inverse text stays legible over photography.
export const heroOverlayClass = 'absolute inset-0 bg-backdrop';

// Text column — left/center aligned like the reference (text_alignment "left center").
export const heroContentClass =
  'relative z-10 mx-auto flex h-full max-w-[1200px] flex-col items-start justify-center gap-4 px-6 sm:px-8 lg:px-12';

export const heroTextStackClass = 'flex max-w-xl flex-col gap-3';

// Dots row.
export const heroDotsClass = 'absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5';

export const heroDotVariants = cva('size-2.5 rounded-full transition-colors', {
  variants: {
    active: {
      true: 'bg-inverse',
      false: 'bg-inverse/50 hover:bg-inverse/80',
    },
  },
  defaultVariants: { active: false },
});

export const heroArrowsClass = 'absolute bottom-5 right-6 z-20 hidden gap-2 md:flex';

export const heroArrowClass =
  'inline-flex size-10 items-center justify-center rounded-full bg-inverse/20 text-inverse backdrop-blur transition-colors hover:bg-inverse/35';

// Mobile stacked variant: image with overlaid text in a fixed-aspect band.
export const heroMobileClass = 'flex flex-col md:hidden';

export const heroMobileSlideClass = 'relative h-72 w-full overflow-hidden';

export const heroMobileContentClass =
  'absolute inset-0 z-10 flex flex-col items-start justify-center gap-3 px-6';

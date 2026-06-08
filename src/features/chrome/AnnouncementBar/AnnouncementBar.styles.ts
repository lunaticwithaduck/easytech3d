import { cva } from 'class-variance-authority';

// Top promo strip — faithful to the Shopify theme's `.AnnouncementBar`:
// full-width, fixed 40px tall, orange #fd5b2a band with centered #ffffff copy.
// Slides are stacked absolutely so the bar keeps a stable 40px height while the
// active message cross-fades (autoplay ~4s, no close button).
export const announcementBarClass = cva(
  'relative flex h-[40px] w-full items-center justify-center overflow-hidden bg-[#fd5b2a] px-4 text-center text-inverse',
);

// Each slide fills the bar and cross-fades on the `active` flag.
export const announcementSlideVariants = cva(
  'absolute inset-0 flex items-center justify-center px-4 text-center transition-opacity duration-500 ease-in-out',
  {
    variants: {
      active: {
        true: 'opacity-100',
        false: 'pointer-events-none opacity-0',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

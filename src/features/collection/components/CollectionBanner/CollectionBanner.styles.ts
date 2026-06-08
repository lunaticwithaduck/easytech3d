import { cva } from 'class-variance-authority';

// Full-bleed banner well: the collection.image fills it, a dark scrim sits on top, and the
// collection title is centered over the scrim — the theme's `collection_image_mode: banner`.
export const bannerVariants = cva(
  'relative flex min-h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-backdrop md:min-h-72 lg:min-h-80',
);

export const bannerImageVariants = cva('object-cover');

// Semi-opaque scrim so the white title stays legible over any photo (theme default 40% black).
export const bannerOverlayVariants = cva('absolute inset-0 bg-backdrop/40');

export const bannerTitleVariants = cva('relative z-10 px-6 text-center');

import { cva } from 'class-variance-authority';

// Full-bleed hero band: the featured image fills it, a dark scrim sits on top, and the
// breadcrumbs + title overlay the bottom-left — matching the live theme's custom_page_header.
export const heroVariants = cva('relative w-full overflow-hidden bg-text');

export const heroMediaVariants = cva('aspect-[16/7] w-full md:aspect-[21/8]');

export const heroImageVariants = cva('object-cover');

// #000 @ 40% overlay from the Liquid `image_overlay_color` / `image_overlay_opacity` defaults.
export const heroScrimVariants = cva('absolute inset-0 bg-text/40');

// Overlay content anchored to the bottom of the hero, constrained to the page gutter.
export const heroOverlayVariants = cva(
  'absolute inset-x-0 bottom-0 flex flex-col gap-4 px-6 pb-8 md:pb-12 lg:px-8',
);

export const heroTitleVariants = cva('max-w-3xl text-balance drop-shadow-md');

// Meta row: author label + bullet-separated date, muted beneath the title.
export const metaRowVariants = cva('flex flex-wrap items-center gap-x-2 gap-y-1');

export const metaDotVariants = cva('select-none');

// The body column — narrow, centered, vertically padded.
export const bodyWrapVariants = cva('flex flex-col gap-10 py-12 md:py-16');

// Prose styling for the dangerouslySetInnerHTML article content. Tokens only; targets the raw
// HTML the backend/Liquid emits (headings, paragraphs, lists, links, images, blockquotes).
export const proseVariants = cva(
  [
    'max-w-none leading-relaxed text-text',
    '[&_p]:my-4',
    '[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text',
    '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-text',
    '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6',
    '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6',
    '[&_li]:my-1',
    '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline',
    '[&_strong]:font-semibold [&_strong]:text-text',
    '[&_img]:my-6 [&_img]:rounded-lg',
    '[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted',
    '[&_hr]:my-8 [&_hr]:border-border',
  ].join(' '),
);

export const backLinkRowVariants = cva('border-t border-border pt-8');

// Inline icon + label for the back-to-blog link.
export const backLinkVariants = cva('inline-flex items-center gap-2 font-medium');

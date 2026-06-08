import { cva } from 'class-variance-authority';

// Prose block for the collection's rich-text description, rendered at the bottom of the listing
// (theme's `show_collection_description: bottom`). Token-driven typography for the injected HTML.
export const proseVariants = cva(
  'mt-12 border-t border-border pt-8 text-base leading-relaxed text-muted [&_a]:text-primary [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-text [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:text-text [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6',
);

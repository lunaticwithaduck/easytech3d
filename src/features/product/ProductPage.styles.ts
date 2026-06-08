import { cva } from 'class-variance-authority';

// Two-column product layout: media gallery on the left, the buy-box / info on the right.
// Stacks on mobile, splits ~55/45 from the `lg` breakpoint (matches the reference's media-medium).
export const productLayoutClass =
  'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12';

// Right column: vertical stack of vendor → title → price → selectors → buy actions → description.
export const productInfoClass = 'flex flex-col gap-5';

// Muted, uppercase vendor eyebrow above the title.
export const vendorClass = 'uppercase tracking-wide';

// Small "tax included" note beneath the price, like the reference's "ДДС включено".
export const taxNoteClass = 'mt-1';

// Divider rule separating the buy actions from the long-form description.
export const dividerClass = 'h-px w-full bg-border';

// Styled prose for the raw product descriptionHtml. Tokens-only child selectors give paragraphs,
// lists and headings consistent rhythm without a typography plugin.
export const proseClass =
  'max-w-none text-text [&_a]:text-primary [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:mb-1 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5';

// The related-products band sits below the buy box with its own top spacing.
export const relatedSectionClass = 'mt-16 lg:mt-20';

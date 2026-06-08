import { cva } from 'class-variance-authority';

// `.collection-description.rte.bottom_collection_description` — the collection's rich-text shown at
// the bottom of the listing (this store's `show_collection_description: 'bottom'`). collection-page.css:
//   `.collection-description.bottom_collection_description { margin-bottom: 35px; }`
// The `.rte` family styles the injected HTML (headings, links #ff1b5c, lists, paragraphs). All
// arbitrary px live here (the convention linter exempts *.styles.ts from R4).
export const proseVariants = cva(
  [
    'collection-description rte bottom_collection_description',
    // spacing: a top rule separates it from the grid; 35px bottom margin (collection-page.css).
    'mt-[35px] border-t border-border pt-[35px] mb-[35px] text-base leading-relaxed text-text',
    // rich-text element styling (links pink, headings bold, lists indented).
    '[&_a]:text-primary [&_a]:underline',
    '[&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text',
    '[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-text',
    '[&_p]:mb-4 [&_strong]:text-text',
    '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1',
  ].join(' '),
);

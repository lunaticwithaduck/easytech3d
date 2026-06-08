import { cva } from 'class-variance-authority';

// ProductGrid — 1:1 port of the Warehouse flexbox grid used by `collection-template.liquid`:
//   <div class="grid use_align_height Collection-wrapper grid--uniform grid--view-items"> … </div>
// NOT CSS grid — the theme uses a flexbox row with negative left margin + per-item left padding as
// the gutter. All arbitrary px/% live here (the convention linter exempts *.styles.ts from R4).

// core.css:
//   .grid { display:flex; flex-wrap:wrap; align-items:flex-start; margin:0 0 0 -11px; }
//   @media (max-width:749px){ .grid { margin-left:-22px; } }
// `align-items:inherit` for `.Collection-wrapper` so cells stretch to equal height (cards are h-full).
export const gridVariants = cva(
  'grid use_align_height Collection-wrapper grid--uniform grid--view-items flex flex-wrap items-stretch -ml-[22px] md:-ml-[11px]',
);

// core.css:
//   .grid__item { width:100%; padding-left:11px; }
//   @media (max-width:749px){ .grid__item { padding-left:22px; } }
// Width classes (this store: grid 3 / grid_mobile 1):
//   .small--one-whole  → 100% (<750px)   ·   .medium-up--one-third → 33.333% (≥750px)
// The 30px card bottom spacing comes from `.product-item-block` (inside ProductCard).
export const gridItemVariants = cva(
  'grid__item small--one-whole medium-up--one-third w-full pl-[22px] md:w-1/3 md:pl-[11px]',
);

// Empty-collection notice — `.grid__item.small--text-center > p.text-center` "Няма продукти…".
export const emptyVariants = cva('w-full py-16 text-center');

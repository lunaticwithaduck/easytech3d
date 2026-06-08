import { cva } from 'class-variance-authority';

// CollectionsIndex — 1:1 layout of `list-collections-template.liquid`. All arbitrary px live here
// (the convention linter exempts *.styles.ts from R4).

// Page bottom rhythm (`.index-section` ~35px). The header carries its own bottom margin.
export const pageVariants = cva('pb-[35px]');

// `.page-width { max-width:1660px; margin:0 auto; padding:0 55px; }` (core.css) — the content column.
export const pageWidthVariants = cva('mx-auto w-full max-w-[1660px] px-[20px] md:px-[55px]');

// `<ul class="grid grid--uniform list-collections-grid use_align_height">` — the Warehouse flexbox
// grid (NOT CSS grid): flex row, negative left margin gutter. core.css:
//   .grid { display:flex; flex-wrap:wrap; align-items:flex-start; margin:0 0 0 -11px; }
//   @media (max-width:749px){ .grid { margin-left:-22px; } }
//   .grid--uniform .grid__item { margin-bottom:20px; }
export const gridVariants = cva(
  // bare `grid` theme class dropped — collides with Tailwind `display:grid`; the layout is flexbox.
  'grid--uniform list-collections-grid use_align_height flex flex-wrap items-stretch -ml-[22px] md:-ml-[11px]',
);

// `<li class="grid__item small--one-whole tablet--one-third medium-up--one-third">` — grid 3 /
// grid_mobile 1: 100% mobile, 33.333% from tablet up. core.css:
//   .grid__item { width:100%; padding-left:11px; }  @media(max-width:749px){ padding-left:22px; }
//   .grid--uniform .grid__item { margin-bottom:20px; }
export const gridItemVariants = cva(
  'grid__item small--one-whole tablet--one-third medium-up--one-third w-full pl-[22px] mb-[20px] md:w-1/3 md:pl-[11px]',
);

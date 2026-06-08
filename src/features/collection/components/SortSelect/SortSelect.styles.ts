import { cva } from 'class-variance-authority';

// SortSelect — 1:1 port of `.toolbar_sort_by-block` (collection-page.css). All arbitrary px/colors
// live here (the convention linter exempts *.styles.ts from R4).

// `.toolbar_sort_by-block { display:flex; align-items:center; min-width:205px; border-radius:50px;
//   border:2px solid #ebebeb; padding:12px 15px; font-size:14px (base-2); }`
// Mobile (≤749px): width:100%, margin-top:20px.
export const sortWrapperVariants = cva(
  'toolbar_sort_by-block flex min-w-[205px] items-center rounded-[50px] border-2 border-border px-[15px] py-[12px] text-[14px] max-[749px]:mt-[20px] max-[749px]:w-full',
);

// `.toolbar_sort_by-block .select-label { margin:0 5px 0 0; text-transform:none; font-size:inherit;
//   color:inherit; }`
export const sortLabelVariants = cva(
  'select-label mr-[5px] whitespace-nowrap normal-case text-[inherit]',
);

// `.filters-toolbar__input-wrapper.select-group` — relative wrapper holding the select + chevron.
export const sortFieldVariants = cva('select-group relative inline-flex w-full items-center');

// `.toolbar_sort_by-block .filters-toolbar__input { border:none; padding:0; color:inherit;
//   font-size:inherit; }` — native select stripped of its chrome, sits inside the pill.
export const sortSelectVariants = cva(
  'filters-toolbar__input w-full cursor-pointer appearance-none border-none bg-transparent p-0 pr-[18px] text-[inherit] text-text focus:outline-none',
);

// `.filters-toolbar .icon-chevron-down { fill:var(--color-text-field-text); width/height:10px;
//   right:8px; }` — the theme select chevron pinned to the right of the field.
export const sortChevronVariants = cva(
  'icon-chevron-down pointer-events-none absolute right-0 top-1/2 h-[10px] w-[10px] -translate-y-1/2 fill-text',
);

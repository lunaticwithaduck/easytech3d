import { cva } from 'class-variance-authority';

// CollectionToolbar — 1:1 port of the `.filters-toolbar` block in `collection-template.liquid`
// / `custom_page_header.liquid`. All arbitrary px/colors live here (R4-exempt *.styles.ts).

// `.filters-toolbar { display:flex; align-items:center; justify-content:flex-end; }`
// In the banner the wrapper `.custom_header-filters-toolbar-block` is full width and right-aligned.
export const toolbarVariants = cva(
  'filters-toolbar flex flex-wrap items-center justify-end gap-y-[20px]',
);

// `.collection__layout-button { border-radius:50%; width:49px; height:49px; padding:0;
//   margin-right:15px; background:transparent; border:2px solid #ebebeb; transition:all .3s; }`
// `.is-selected { background:#fff; border-color:transparent; box-shadow:0 2px 3px 1px #ebebeb; }`
const layoutButtonBase = [
  'collection__layout-button mr-[15px] flex h-[49px] w-[49px] items-center justify-center rounded-full',
  'border-2 p-0 [transition:all_.3s]',
].join(' ');

export const layoutButtonVariants = cva(layoutButtonBase, {
  variants: {
    selected: {
      // `.is-selected` — white surface, transparent border, soft shadow (active layout).
      true: 'is-selected border-transparent bg-surface text-text shadow-[0_2px_3px_1px_#ebebeb]',
      // resting toggle — transparent fill, 2px hairline border.
      false: 'border-border bg-transparent text-text',
    },
  },
  defaultVariants: { selected: false },
});

// The 18px theme grid/list glyphs inside the 49px circle button.
export const layoutIconClass = 'h-[18px] w-[18px]';

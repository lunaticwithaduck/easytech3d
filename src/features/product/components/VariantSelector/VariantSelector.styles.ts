import { cva } from 'class-variance-authority';

// VariantSelector — 1:1 port of the `product_options_block` in `sections/product-template.liquid`
// (+ `snippets/swatch.liquid` for color, theme-css §8). Color options render as 18px swatch circles
// with the pink selection ring; non-color options render as pill buttons. All arbitrary px/colors
// live here (R4 exempts *.styles.ts).

// `.product-form__controls-group.product_options_block_wrapper` — vertical stack of option groups,
// each separated with 20px rhythm.
export const optionsWrapperClass = 'product_options_block_wrapper flex flex-col gap-[20px]';

// `.selector-wrapper.product-form__item` — one option group (label + values).
export const optionGroupClass = 'selector-wrapper product-form__item flex flex-col gap-[10px]';

// `label.header` — the option name above the values ("Цвят", "Тегло"). 14px, weight 700, muted-ish.
export const optionLabelClass = 'header text-[14px] font-bold text-text';

// `.swatch_elements_wrapper` — wrapping row of color circles.
export const swatchRowClass = 'swatch_elements_wrapper flex flex-wrap items-center gap-[12px]';

// `.color-swatch` / `.swatch-element.color` — a single 18px color circle (theme-css §8):
//   `.color-swatch__item { width:18px; height:18px; border-radius:50% }`
//   `:after { ring offset 5px; border:2px solid #eee → active #ff1b5c }`
// The fill is painted from the `--swatch-color` custom property (R1) set on each item.
export const swatchItemVariants = cva(
  'color-swatch__item relative block size-[18px] cursor-pointer rounded-full [background-color:var(--swatch-color)] ' +
    "after:absolute after:-left-[5px] after:-top-[5px] after:size-[calc(100%+10px)] after:rounded-full after:border-2 after:content-['']",
  {
    variants: {
      active: {
        true: 'after:border-primary',
        false: 'after:border-[#eee] hover:after:border-primary',
      },
    },
    defaultVariants: { active: false },
  },
);

// `.swatch_elements_wrapper` for non-color options — a wrapping row of pill value buttons.
export const pillRowClass = 'flex flex-wrap gap-[10px]';

// Non-color option value pill. The theme renders these as outlined buttons; selected fills with the
// `#3a3a3a` secondary (the option-selected state). 50px radius (pill), 14px label.
export const pillVariants = cva(
  'inline-flex items-center rounded-[50px] border-2 px-[18px] py-[8px] text-[14px] font-bold leading-none transition-colors',
  {
    variants: {
      selected: {
        true: 'border-secondary bg-secondary text-inverse',
        false: 'border-border bg-surface text-text hover:border-secondary',
      },
    },
    defaultVariants: { selected: false },
  },
);

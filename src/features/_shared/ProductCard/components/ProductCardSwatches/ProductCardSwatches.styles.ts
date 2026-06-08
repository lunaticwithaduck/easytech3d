import { cva } from 'class-variance-authority';

// Color swatches — 1:1 port of theme.css §8 (`.product-item__swatches`). Absolute top-right of the
// card, a vertically-stacked column of 18px circles. All arbitrary px/colors live here (R4-exempt).

// `.product-item__swatches { position:absolute; top:20px; right:20px; display:flex; }`
export const swatchesClass =
  'product-item__swatches absolute right-[20px] top-[20px] z-[1] flex';

// `.product-item__swatches .color-swatch-list { display:flex; flex-direction:column; align-items:center }`
export const swatchListClass = 'color-swatch-list flex flex-col items-center';

// `.color-swatch { position:relative; display:inline-block; margin:6px; vertical-align:middle; }`
export const swatchClass = 'color-swatch relative m-[6px] inline-block align-middle';

// `.color-swatch__item { width:18px; height:18px; border-radius:50%; }`
// `.color-swatch__item:after { content:""; top:-5px; left:-5px; width:calc(100%+10px);
//   height:calc(100%+10px); border-radius:50%; border:2px solid #eee; }` — the selectable ring.
// `.color-swatch__radio:checked + .color-swatch__item:after { border-color:#ff1b5c }` (active ring).
export const swatchItemVariants = cva(
  [
    'color-swatch__item relative block h-[18px] w-[18px] cursor-pointer rounded-full',
    // fill the circle with the per-record color exposed as the `--swatch-color` custom property
    'bg-[var(--swatch-color)]',
    'after:absolute after:-left-[5px] after:-top-[5px] after:h-[calc(100%+10px)] after:w-[calc(100%+10px)]',
    'after:rounded-full after:border-2 after:content-[""]',
  ].join(' '),
  {
    variants: {
      active: {
        // active swatch ring = brand pink #ff1b5c (theme `:checked + .color-swatch__item:after`)
        true: 'after:border-primary',
        // inactive ring = light grey #eee
        false: 'after:border-[#eee]',
      },
    },
    defaultVariants: { active: false },
  },
);

export type SwatchItemVariants = Parameters<typeof swatchItemVariants>[0];

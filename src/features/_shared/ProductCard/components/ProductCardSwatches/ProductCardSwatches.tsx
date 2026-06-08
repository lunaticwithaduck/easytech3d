import type { CSSProperties } from 'react';
import {
  swatchClass,
  swatchesClass,
  swatchItemVariants,
  swatchListClass,
} from './ProductCardSwatches.styles';

/** A single Цвят option: its display name + the fill color rendered on the 18px circle. */
export type SwatchColor = { name: string; color: string };

export type ProductCardSwatchesProps = {
  /** Цвят option values, mapped to fill colors. Static is fine (ProductCardData carries no options). */
  colors?: SwatchColor[];
};

// Default Цвят palette (from the mock catalog's `COLORS` set / theme `product.options`). These are
// the static swatch fills used until the backend serves real per-variant swatch media — matching
// the live store, where the card swatches mirror the product's color option values.
const DEFAULT_COLORS: SwatchColor[] = [
  { name: 'Черен', color: '#232323' },
  { name: 'Бял', color: '#ffffff' },
  { name: 'Червен', color: '#d0021b' },
  { name: 'Син', color: '#1b6fd0' },
];

// `.product-item__swatches` — absolute top-right column of color circles, reproducing the
// `color_swatch_capture` block in `snippets/product-card-item.liquid`. The first swatch renders as
// the selected (checked) one — the theme marks `value_to_match == value` with the pink ring.
export function ProductCardSwatches({ colors = DEFAULT_COLORS }: ProductCardSwatchesProps) {
  if (colors.length === 0) return null;

  return (
    <div className={swatchesClass}>
      <div className={swatchListClass}>
        {colors.map((swatch, index) => (
          <span key={swatch.name} className={swatchClass}>
            <span
              className={swatchItemVariants({ active: index === 0 })}
              title={swatch.name}
              // Per-record dynamic fill — sanctioned via CSS custom property (R1). The styles file
              // paints `background-color: var(--swatch-color)` onto the 18px circle.
              style={{ '--swatch-color': swatch.color } as CSSProperties}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

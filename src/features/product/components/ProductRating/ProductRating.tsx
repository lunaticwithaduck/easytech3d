import type { CSSProperties } from 'react';
import { Text } from '@/design-system/primitives/Text/Text';
import { countClass, ratingClass, starsClass } from './ProductRating.styles';

export type ProductRatingProps = {
  /** Average rating value (e.g. 4.5). */
  rating: number;
  /** Maximum of the scale (the theme's `scale_max`, typically 5). */
  ratingMax?: number;
  /** Number of reviews shown as "(N)" after the stars. */
  count?: number;
};

// 1:1 port of the `rating` block in `sections/product-template.liquid` + component-rating.css.
//   <div class="rating" role="img"><span class="rating-star" style="--rating:…"></span></div>
//   <p class="rating-count">(N)</p>
// The five `★★★★★` glyphs are gradient-clipped: filled up to `rating/ratingMax`, the rest muted.
// The fill % is computed here and handed to the styles via the `--rating-percent` custom property
// (the sanctioned R1 escape for a per-record dynamic value CVA can't hold).
export function ProductRating({ rating, ratingMax = 5, count }: ProductRatingProps) {
  const percent = `${Math.max(0, Math.min(1, rating / ratingMax)) * 100}%`;

  return (
    <div className={ratingClass} role="img" aria-label={`${rating} от ${ratingMax} звезди`}>
      <span
        className={starsClass}
        aria-hidden
        // Per-record dynamic fill stop — sanctioned via CSS custom property (R1).
        style={{ '--rating-percent': percent } as CSSProperties}
      >
        ★★★★★
      </span>
      {count !== undefined ? (
        <Text as="span" className={countClass}>
          {`(${count})`}
        </Text>
      ) : null}
    </div>
  );
}

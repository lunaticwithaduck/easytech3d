import { Heading } from '@/design-system/primitives/Heading/Heading';
import { ProductCarousel } from '@/features/_shared/ProductCarousel/ProductCarousel';
import type { ProductCardData } from '@/server/catalog/types';
import { headerClass, rootClass } from './ProductRecommendations.styles';

export type ProductRecommendationsProps = {
  products: ProductCardData[];
  /** Section heading. Defaults to the live store's "Може също да харесате…". */
  heading?: string;
};

// 1:1 port of `sections/product-recommendations.liquid` — a centered `<h2>` over a carousel of
// related product cards (`recommendations.intent == 'related'`, grid_mobile 2 → two-up on mobile).
// The live store renders the BG title "Може също да харесате…" (the theme heading setting default is
// "You may also like"). Rendered server-side; the carousel itself is the shared client island.
export function ProductRecommendations({
  products,
  heading = 'Може също да харесате…',
}: ProductRecommendationsProps) {
  if (products.length === 0) return null;

  return (
    <div className={rootClass}>
      <div className={headerClass}>
        <Heading as="h2">{heading}</Heading>
      </div>
      <ProductCarousel products={products} />
    </div>
  );
}

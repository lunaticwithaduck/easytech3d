import { Text } from '@/design-system/primitives/Text/Text';
import { ProductCard } from '@/features/_shared/ProductCard/ProductCard';
import type { ProductCardData } from '@/server/catalog/types';
import { emptyVariants, gridVariants } from './ProductGrid.styles';

export type ProductGridProps = {
  products: ProductCardData[];
};

// The collection's product listing: a responsive grid of ProductCards (3-up desktop / 2 tablet /
// 1 mobile). Falls back to the theme's "no matches" copy when the collection has no products.
export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className={emptyVariants()}>
        <Text as="p" size="lg" color="muted" value="В тази колекция все още няма продукти." />
      </div>
    );
  }

  return (
    <div className={gridVariants()}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

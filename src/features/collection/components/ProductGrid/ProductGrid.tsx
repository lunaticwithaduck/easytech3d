import { Text } from '@/design-system/primitives/Text/Text';
import { ProductCard } from '@/features/_shared/ProductCard/ProductCard';
import type { ProductCardData } from '@/server/catalog/types';
import { emptyVariants, gridItemVariants, gridVariants } from './ProductGrid.styles';

export type ProductGridProps = {
  products: ProductCardData[];
};

// The collection's product listing — the Warehouse flexbox grid from `collection-template.liquid`:
//   <div class="grid use_align_height Collection-wrapper grid--uniform grid--view-items">
//     {% include 'product-card-item' %}  (each is a .grid__item.product-item-block cell)
//   </div>
// 3-up desktop (`medium-up--one-third`) / 1-up mobile (`small--one-whole`, grid_mobile:1). The
// `.grid__item` width classes are merged onto each ProductCard's `.product-item-block` block, exactly
// as the theme renders them on the same element. Falls back to "Няма продукти…" when empty.
export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className={emptyVariants()}>
        <Text as="p" color="muted" value="Няма продукти в тази колекция" />
      </div>
    );
  }

  return (
    <div className={gridVariants()}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} className={gridItemVariants()} />
      ))}
    </div>
  );
}

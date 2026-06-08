import { Container } from '@/features/_shared/Container/Container';
import { ProductCarousel } from '@/features/_shared/ProductCarousel/ProductCarousel';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import { getProductsInCollection } from '@/server/catalog/data';
import type { ProductCardData } from '@/server/catalog/types';
import { groupClass, groupStackClass } from './FeaturedProductsRow.styles';

export type FeaturedGroup = {
  title: string;
  subtitle: string;
  collectionHandles: readonly string[];
};

export type FeaturedProductsRowProps = {
  groups: readonly FeaturedGroup[];
};

// Gather a group's products from all its source collections, de-duplicating by id so a product
// appearing in multiple handles shows once.
function gatherProducts(handles: readonly string[]): ProductCardData[] {
  const seen = new Set<string>();
  const out: ProductCardData[] = [];
  for (const handle of handles) {
    for (const product of getProductsInCollection(handle)) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      out.push(product);
    }
  }
  return out;
}

// The three featured-product blocks from the live homepage: each a left-aligned eyebrow+title
// over a horizontal carousel of the group's products.
export function FeaturedProductsRow({ groups }: FeaturedProductsRowProps) {
  return (
    <Section>
      <Container>
        <div className={groupStackClass}>
          {groups.map((group) => {
            const products = gatherProducts(group.collectionHandles);
            if (products.length === 0) return null;
            return (
              <div key={`${group.title}-${group.subtitle}`} className={groupClass}>
                <SectionHeading title={group.title} subtitle={group.subtitle} align="left" />
                <ProductCarousel products={products} />
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

import { routes } from '@/config/routes';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import type { Collection, ProductCardData, SortKey } from '@/server/catalog/types';
import { headingBlockVariants, pageVariants } from './CollectionPage.styles';
import { CollectionBanner } from './components/CollectionBanner/CollectionBanner';
import { CollectionDescription } from './components/CollectionDescription/CollectionDescription';
import { CollectionToolbar } from './components/CollectionToolbar/CollectionToolbar';
import { ProductGrid } from './components/ProductGrid/ProductGrid';

export type CollectionPageProps = {
  collection: Collection;
  products: ProductCardData[];
  sort: SortKey;
};

// Collection listing screen. Top to bottom: breadcrumbs (Начало › Колекции › title), a banner
// hero when the collection has an image (title overlaid) — otherwise a plain heading — then the
// count/sort toolbar, the responsive product grid, and the RTE description at the bottom.
// Faithful to `sections/collection-template.liquid` for this store's settings.
export function CollectionPage({ collection, products, sort }: CollectionPageProps) {
  const breadcrumbs = [
    { label: 'Начало', href: routes.home },
    { label: 'Колекции', href: routes.collections },
    { label: collection.title },
  ];

  return (
    <Container>
      <div className={pageVariants()}>
        <Breadcrumbs items={breadcrumbs} />

        {collection.image ? (
          <CollectionBanner image={collection.image} title={collection.title} />
        ) : (
          <div className={headingBlockVariants()}>
            <Text as="h1" size="4xl" weight="bold">
              {collection.title}
            </Text>
          </div>
        )}

        <CollectionToolbar count={products.length} sort={sort} />

        <ProductGrid products={products} />

        {collection.descriptionHtml ? (
          <CollectionDescription html={collection.descriptionHtml} />
        ) : null}
      </div>
    </Container>
  );
}

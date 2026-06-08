import { routes } from '@/config/routes';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import type { Collection } from '@/server/catalog/types';
import { gridVariants, headingVariants, pageVariants } from './CollectionsIndex.styles';
import { CollectionCard } from './components/CollectionCard/CollectionCard';

export type CollectionsIndexProps = {
  collections: Collection[];
};

// Collections index ("Колекции"): breadcrumbs, a centered page title, and a responsive grid of
// collection cards linking to each collection page. Faithful to `templates/list-collections.json`.
export function CollectionsIndex({ collections }: CollectionsIndexProps) {
  const breadcrumbs = [{ label: 'Начало', href: routes.home }, { label: 'Колекции' }];

  return (
    <Container>
      <div className={pageVariants()}>
        <Breadcrumbs items={breadcrumbs} />

        <div className={headingVariants()}>
          <Text as="h1" size="4xl" weight="bold" value="Колекции" />
        </div>

        <div className={gridVariants()}>
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </Container>
  );
}

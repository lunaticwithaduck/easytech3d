import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { getCollection, getProductsInCollection } from '@/server/catalog/data';
import {
  type FeaturedTab,
  FeaturedProductsTabs,
} from './components/FeaturedProductsTabs/FeaturedProductsTabs';
import { groupStackClass } from './FeaturedProductsRow.styles';

export type FeaturedGroup = {
  title: string;
  subtitle: string;
  collectionHandles: readonly string[];
};

export type FeaturedProductsRowProps = {
  groups: readonly FeaturedGroup[];
};

// Build the tab set for a group: one tab per source collection (label = collection title), each
// carrying that collection's products. Empty collections are skipped.
function buildTabs(handles: readonly string[]): FeaturedTab[] {
  const tabs: FeaturedTab[] = [];
  for (const handle of handles) {
    const products = getProductsInCollection(handle);
    if (products.length === 0) continue;
    tabs.push({ label: getCollection(handle)?.title ?? handle, products });
  }
  return tabs;
}

// The three featured-product blocks from the live homepage, each a tabbed carousel.
export function FeaturedProductsRow({ groups }: FeaturedProductsRowProps) {
  return (
    <Section>
      <Container>
        <div className={groupStackClass}>
          {groups.map((group) => {
            const tabs = buildTabs(group.collectionHandles);
            if (tabs.length === 0) return null;
            return (
              <FeaturedProductsTabs
                key={`${group.title}-${group.subtitle}`}
                title={group.title}
                subtitle={group.subtitle}
                tabs={tabs}
              />
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

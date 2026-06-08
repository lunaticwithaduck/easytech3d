import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { getCollection } from '@/server/catalog/data';
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

// Per-group carousel settings, keyed by the group's subtitle (the stable identifier from
// templates/index.json). Mirrors the three live featured-products sections:
//   1. "Най-Популярни"        — navigation_style large, autoplay 4s
//   2. "за истински ентусиасти" — navigation_style normal, autoplay off
//   3. "3д принтери"          — navigation_style large, autoplay 5s
// (enable_carousel/show_dots/show_arrows are all true on the live store, so the carousel always
// renders dots + custom circle arrows.) Groups not listed fall back to no autoplay.
const GROUP_AUTOPLAY: Record<string, number | false> = {
  'Най-Популярни': 4000,
  '3д принтери': 5000,
};

// Build the tab set for a group: one tab per source collection (label = collection title, handle =
// collection handle). The active tab's products are resolved client-side in FeaturedProductsTabs via
// getProductsInCollection(handle), matching the theme's tab-swap behaviour.
function buildTabs(handles: readonly string[]): FeaturedTab[] {
  return handles.map((handle) => ({
    label: getCollection(handle)?.title ?? handle,
    handle,
  }));
}

/**
 * FeaturedProductsRow — the three featured-product blocks from the live homepage
 * (`templates/index.json` → featured-products ×3). Each group is a left-aligned SectionHeading above
 * a TAB NAV (one `.index-tabs_nav--item` per collection in the group) and the active tab's
 * ProductCarousel (4-up desktop, dots + circle arrows). Faithful to
 * `sections/featured-products.liquid`. Export name + `groups` prop preserved so Home.tsx composes
 * it unchanged (`groups={homeConfig.featuredGroups}`).
 */
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
                autoPlay={GROUP_AUTOPLAY[group.subtitle] ?? false}
              />
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

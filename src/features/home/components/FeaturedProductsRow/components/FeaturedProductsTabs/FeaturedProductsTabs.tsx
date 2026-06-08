'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { ProductCarousel } from '@/features/_shared/ProductCarousel/ProductCarousel';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import { getProductsInCollection } from '@/server/catalog/data';
import {
  sectionHeaderClass,
  tabHeadingClass,
  tabNavClass,
  tabNavItemVariants,
  tabNavWrapClass,
  tabsWrapClass,
} from './FeaturedProductsTabs.styles';

// One tab = one source collection (label = collection title, handle = collection handle). Products
// for the active tab are resolved on the client via getProductsInCollection(handle) — the theme's
// `theme.FeaturedProducts` swaps the visible collection panel on tab click.
export type FeaturedTab = { label: string; handle: string };

export type FeaturedProductsTabsProps = {
  /** Section title heading copy (`section.settings.title`), rendered as the h2. */
  title: string;
  /** `.h5` eyebrow above the title (`section.settings.subtitle`). */
  subtitle: string;
  /** One tab per collection block (label + handle). The first is active on mount (`forloop.first`). */
  tabs: FeaturedTab[];
  /** Cap shown per collection (`block.settings.max_products_count`); defaults to the theme's 10. */
  maxProducts?: number;
  /** Autoplay ms (`enable_autoplay ? cycle_speed*1000 : false`) forwarded to the carousel. */
  autoPlay?: number | false;
};

/**
 * FeaturedProductsTabs — faithful client port of one `featured-products.liquid` block
 * (`data-section-type="featured-products"`, handler `theme.FeaturedProducts`).
 *
 * Renders the left-aligned SectionHeading (eyebrow=subtitle, title=title), then a TAB NAV
 * (`.index-tabs_nav--item` per collection — active tab = pink #ff1b5c 4px underline, inactive
 * opacity 0.5, items margin-right ~90px desktop), then the ACTIVE tab's ProductCarousel (4-up
 * desktop, dots + circle arrows). Switching tabs swaps the collection via getProductsInCollection.
 */
export function FeaturedProductsTabs({
  title,
  subtitle,
  tabs,
  maxProducts = 10,
  autoPlay = false,
}: FeaturedProductsTabsProps) {
  const [active, setActive] = useState(0);
  const activeHandle = (tabs[active] ?? tabs[0])?.handle;

  // The active tab's products — resolved client-side, capped at the block's max_products_count.
  const products = useMemo(
    () => (activeHandle ? getProductsInCollection(activeHandle).slice(0, maxProducts) : []),
    [activeHandle, maxProducts],
  );

  if (tabs.length === 0) return null;

  return (
    <div className={tabsWrapClass}>
      <div className={sectionHeaderClass}>
        <SectionHeading title={title} subtitle={subtitle} align="left" titleAs="h2" />

        {/* .index-tabs_nav__wrapper.navigation_style_* > .index-tabs_nav — one tab per collection */}
        <div className={tabNavWrapClass}>
          <div className={tabNavClass} role="tablist" aria-label={title}>
            {tabs.map((tab, i) => (
              <Button asChild unstyled key={tab.handle} className={tabNavItemVariants({ active: i === active })}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={tab.label}
                  onClick={() => setActive(i)}
                >
                  <Heading as="h3" level="h4" className={tabHeadingClass}>
                    {tab.label}
                  </Heading>
                </button>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* The active tab's .index-tabs-content_block__slider carousel (4-up, dots + circle arrows). */}
      <ProductCarousel products={products} autoPlay={autoPlay} />
    </div>
  );
}

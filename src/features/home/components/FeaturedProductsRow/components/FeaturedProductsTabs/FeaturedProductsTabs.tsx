'use client';

import { useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { ProductCarousel } from '@/features/_shared/ProductCarousel/ProductCarousel';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import type { ProductCardData } from '@/server/catalog/types';
import { tabNavClass, tabsWrapClass } from './FeaturedProductsTabs.styles';

export type FeaturedTab = { label: string; products: ProductCardData[] };

export type FeaturedProductsTabsProps = {
  title: string;
  subtitle: string;
  tabs: FeaturedTab[];
};

// One featured-products block from the live homepage: an eyebrow+title, a row of collection tabs
// (PLA Pro | PLA | PETG …), and the active tab's product carousel beneath — matching the theme's
// tabbed featured-products section.
export function FeaturedProductsTabs({ title, subtitle, tabs }: FeaturedProductsTabsProps) {
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];

  return (
    <div className={tabsWrapClass}>
      <SectionHeading title={title} subtitle={subtitle} align="left" />
      <div className={tabNavClass} role="tablist">
        {tabs.map((tab, i) => (
          <Button
            key={tab.label}
            variant={i === active ? 'primary' : 'outline'}
            size="sm"
            aria-selected={i === active}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {current ? <ProductCarousel products={current.products} /> : null}
    </div>
  );
}

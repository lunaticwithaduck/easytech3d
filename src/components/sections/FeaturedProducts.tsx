'use client';

// Translated from sections/featured-products.liquid (Shopify Dawn-family theme).
// Faithful markup + verbatim class names so the theme's own CSS styles it. The live theme drives
// the tabs + carousel with Flickity + theme.js; here we reproduce the markup/classes statically and
// add minimal React state for tab switching plus a CSS scroll-snap track with the slider arrows.
//
// Props (per the section contract / app/[locale]/page.tsx):
//   { title, subtitle, navigationStyle, grid, tabs: { heading; products: ShopProduct[] }[] }
// `align_height` is enabled in the live settings, so .section-tabs-content uses `use_align_height`.

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/snippets/Icon';
import { ProductCardItem } from '@/components/product/ProductCardItem';
import type { ShopProduct } from '@/lib/shopify/types';

interface FeaturedProductsTab {
  heading: string;
  products: ShopProduct[];
}

interface FeaturedProductsProps {
  title: string;
  subtitle: string;
  navigationStyle: 'large' | 'normal';
  grid: number;
  tabs: FeaturedProductsTab[];
}

// Liquid `{{ string | handle }}` — lowercase, non-alphanumerics → single hyphens, trimmed.
// Keeps Unicode letters/numbers (Cyrillic stays), matching the rendered `tab_<heading>_...` ids.
function handleize(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

// products_per_row → product-card maxHeight (Liquid {% case products_per_row %}).
function maxHeightFor(grid: number): number {
  switch (grid) {
    case 2:
      return 530;
    case 3:
      return 345;
    case 5:
      return 195;
    case 4:
    default:
      return 250;
  }
}

export function FeaturedProducts({
  title,
  subtitle,
  navigationStyle,
  grid,
  tabs,
}: FeaturedProductsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);

  const maxHeight = maxHeightFor(grid);

  // Stable tab/content ids: synthesize from heading handle + index (block.id isn't in props),
  // mirroring the live `tab_{heading | handle}_{block.id}` pairing between nav anchor and block.
  const tabId = (tab: FeaturedProductsTab, index: number) =>
    `tab_${handleize(tab.heading)}_${index}`;

  const scrollBy = (index: number, direction: -1 | 1) => {
    const track = trackRefs.current[index];
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <section data-section-type="featured-products">
      {tabs.length > 0 && (
        <div className="index-tabs-collections-wrapper section_main_content ">
          <div className="section-header page-width homepage_subtitle_style_match_header">
            {subtitle !== '' && <span className="h5">{subtitle}</span>}

            {title !== '' && <h2>{title}</h2>}

            <div
              className={cn(
                'index-tabs_nav__wrapper',
                `navigation_style_${navigationStyle}`,
              )}
            >
              <div className="index-tabs_nav ">
                {tabs.map((tab, index) => (
                  <a
                    key={tabId(tab, index)}
                    href="javascript:void(0)"
                    className={cn(
                      'index-tabs_nav--item',
                      index === activeIndex && 'active',
                    )}
                    data-index={index}
                    data-href={tabId(tab, index)}
                    aria-label={tab.heading}
                    onClick={() => setActiveIndex(index)}
                  >
                    {navigationStyle === 'large' ? (
                      title !== '' ? (
                        <h3>{tab.heading}</h3>
                      ) : (
                        <h2>{tab.heading}</h2>
                      )
                    ) : (
                      <h3>{tab.heading}</h3>
                    )}
                  </a>
                ))}
              </div>

              <div className="slider_custom_arrows">
                <a
                  href="javascript:void(0)"
                  className="button-prev btn btn--circle-arrow"
                  aria-label="Previous"
                  aria-describedby="button previous"
                  onClick={() => scrollBy(activeIndex, -1)}
                >
                  <Icon name="tail-left" />
                </a>
                <a
                  href="javascript:void(0)"
                  className="button-next btn btn--circle-arrow"
                  aria-label="Next"
                  aria-describedby="button next"
                  onClick={() => scrollBy(activeIndex, 1)}
                >
                  <Icon name="tail-right" />
                </a>
              </div>
            </div>
          </div>

          <div className="section-tabs-content   use_align_height   ">
            {tabs.map((tab, index) => (
              <div
                key={tabId(tab, index)}
                className={cn(
                  'index-tabs-content_block',
                  index === activeIndex && 'active',
                )}
                id={tabId(tab, index)}
              >
                <div
                  ref={(el) => {
                    trackRefs.current[index] = el;
                  }}
                  className={cn(
                    'zoom-fade-animation index-tabs-content_block__slider',
                    `slides_${tab.products.length}`,
                  )}
                >
                  {tab.products.map((product) => (
                    <ProductCardItem
                      key={product.id}
                      product={product}
                      maxHeight={maxHeight}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

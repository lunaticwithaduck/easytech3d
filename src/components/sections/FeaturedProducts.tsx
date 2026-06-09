'use client';

// Featured-products section — design-system version (primitives only; NO theme classes, NO Flickity).
// Translated from sections/featured-products.liquid (Shopify Dawn-family theme). The live theme drove
// the tabs + carousel with Flickity + theme.js; here we keep the tab-switching React state and replace
// the Flickity carousel with a CSS scroll-snap row driven by the prev/next circle arrows.
//
// Props (per the section contract / app/[locale]/page.tsx):
//   { title, subtitle, navigationStyle, grid, tabs: { heading; products: ShopProduct[] }[] }
//
// Probed values (node tools/verify/shoot.cjs / box probe on https://easytech3d.com/):
//   .section-header                → page-width (max-w 1660, px 55), margin-bottom 55px, left-aligned
//   .section-header span.h5        → 14px / 700 / uppercase / ink (#232323) / letter-spacing 0.5px / mb 17.5px
//   .section-header h2             → 46.8px / 700 / ink / letter-spacing 2px / mb 17.5px  (≈ Heading level 2)
//   .index-tabs_nav--item          → margin-right 90px; inactive opacity 0.5, active opacity 1
//   tab heading h3 (large)         → 32px / 700 / letter-spacing 1px
//   tab heading h3 (normal)        → 20px / 700 / letter-spacing 1px
//   .slider_custom_arrows          → margin-left 40px (arrows group)
//   .button-prev/.button-next      → 44×44 circle, white bg, no border, icon 16×16 fill #8d8d8d, m 0 10px
//   .product-item-block            → flex tile, padding-left 11px (the 11px gutter)

import { useRef, useState } from 'react';
import { Button, Container, Heading, Icon, Section, Text, cn } from '@/design-system';
import { ProductCard } from '@/components/product/ProductCard';
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

export function FeaturedProducts({
  title,
  subtitle,
  navigationStyle,
  grid: _grid,
  tabs,
}: FeaturedProductsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Stable tab/content ids: synthesize from heading handle + index (block.id isn't in props),
  // mirroring the live `tab_{heading | handle}_{block.id}` pairing between nav anchor and block.
  const tabId = (tab: FeaturedProductsTab, index: number) =>
    `tab_${handleize(tab.heading)}_${index}`;

  const scrollBy = (index: number, direction: -1 | 1) => {
    const track = trackRefs.current[index];
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  if (tabs.length === 0) return null;

  // Tab heading size differs by navigation style (probed): large 32px, normal 20px; both 700 / +1px.
  // `!` important so the literal size beats the Heading ladder's `md:text-h3` (40px).
  const tabHeadingClass =
    navigationStyle === 'large'
      ? 'text-[32px]! leading-[1] tracking-[1px]'
      : 'text-[20px]! leading-[1] tracking-[1px]';

  return (
    <Section data-section-type="featured-products" className="py-10 md:py-14">
      <Container>
        {/* ── Section header ──────────────────────────────────────────────────
            Live .section-header: left-aligned eyebrow + title + tab nav row,
            margin-bottom 55px. Container already supplies the page-width padding.
        ─────────────────────────────────────────────────────────────────── */}
        <div className="mb-[55px] flex flex-col items-start text-left">
          {subtitle !== '' && (
            // Eyebrow (.h5): 14px / 700 / uppercase / INK (not pink) / +0.5px / mb 17.5px
            <Text
              as="span"
              size="sm"
              weight="bold"
              color="ink"
              uppercase
              className="mb-[17.5px] leading-none tracking-[0.5px]"
              value={subtitle}
            />
          )}

          {title !== '' && (
            // Title h2 — the responsive Heading ladder (≈ probed 46.8px desktop), +2px, mb 17.5px
            <Heading as="h2" level={2} className="mb-[17.5px] leading-none">
              {title}
            </Heading>
          )}

          {/* Tab nav + arrows row: items flow left, arrows group sits after a 40px gap */}
          <div className="flex w-full flex-wrap items-center gap-y-4">
            <nav
              className="flex min-w-0 flex-1 items-center overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
              aria-label={title || 'Категории'}
            >
              {tabs.map((tab, index) => {
                const active = index === activeIndex;
                // Live markup: in `large` style render <h3> when a title exists, else <h2>;
                // in `normal` style always <h3>. Our data always has a title → always <h3>.
                const HeadingTag: 'h2' | 'h3' =
                  navigationStyle === 'large' && title === '' ? 'h2' : 'h3';
                return (
                  <button
                    key={tabId(tab, index)}
                    type="button"
                    data-index={index}
                    aria-label={tab.heading}
                    aria-pressed={active}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'mr-[90px] shrink-0 cursor-pointer whitespace-nowrap pb-1 transition-opacity last:mr-0',
                      active
                        ? 'border-b-2 border-primary opacity-100'
                        : 'opacity-50 hover:opacity-80',
                    )}
                  >
                    <Heading
                      as={HeadingTag}
                      level={3}
                      className={cn('font-bold', tabHeadingClass)}
                    >
                      {tab.heading}
                    </Heading>
                  </button>
                );
              })}
            </nav>

            {/* Prev/next circle arrows — 44×44 white circle, grey icon (#8d8d8d), 40px gap before */}
            <div className="ml-10 flex shrink-0 items-center gap-[10px]">
              <Button
                variant="white"
                size="circle"
                aria-label="Previous"
                aria-describedby="button previous"
                onClick={() => scrollBy(activeIndex, -1)}
                className="text-[#8d8d8d] hover:text-ink"
              >
                <Icon name="tail-left" className="size-4! shrink-0" />
              </Button>
              <Button
                variant="white"
                size="circle"
                aria-label="Next"
                aria-describedby="button next"
                onClick={() => scrollBy(activeIndex, 1)}
                className="text-[#8d8d8d] hover:text-ink"
              >
                <Icon name="tail-right" className="size-4! shrink-0" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Tab content: only the active tab's scroll-snap row is visible ──── */}
        {tabs.map((tab, index) => (
          <div
            key={tabId(tab, index)}
            id={tabId(tab, index)}
            hidden={index !== activeIndex}
            className={cn(index !== activeIndex && 'hidden')}
          >
            {/* Horizontal scroll-snap row: large → 3 cards/row at lg, normal → 4. ~3 at md, ~80% mobile.
                11px gutter (matches the live .product-item-block padding-left). */}
            <div
              ref={(el) => {
                trackRefs.current[index] = el;
              }}
              className="flex flex-nowrap gap-[11px] overflow-x-auto pb-2"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
            >
              {tab.products.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    'shrink-0',
                    // Mobile ~80% peek; md ~3-up; lg a FIXED ~294px card (matches live) so 3 cards
                    // leave right-side whitespace under the arrows instead of stretching to fill.
                    'min-w-[80%]',
                    'md:min-w-[calc(33.333%-8px)]',
                    'lg:min-w-[294px]',
                  )}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Container>
    </Section>
  );
}

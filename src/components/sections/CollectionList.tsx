'use client';

// Translates sections/collection-list.liquid (carousel/circle mode) +
// snippets/collection-grid-item.liquid.
//
// Rendered ground-truth: tools/output/reference/mirror/index.html (lines 11817–11936)
// Data contract: collectionListSection from @/data/home + ShopCollection[] from @/data/catalog
//
// Probed values (node tools/verify/shoot.cjs https://easytech3d.com/ …):
//   .collection-grid-item          → border-radius 20px, padding 40px 20px, bg white
//   .collection-grid-item img      → border-radius 50% (circle clip), margin-bottom 50px, auto x-margin
//   .collection-grid-item__title   → 22px / 700 / letter-spacing 1px / line-height 22px
//   .btn--circle-arrow             → 50% radius, white bg, color #8d8d8d
//   .mega-title--large             → 100px / 700
//   section background             → #f4f4f4 (bg-page)

import { useRef, useState, useCallback } from 'react';
import { Button, Card, Container, Heading, Icon, Image, Link, Section, Text, cn } from '@/design-system';
import { imageUrl } from '@/lib/shopify/image';
import type { ShopCollection } from '@/lib/shopify/types';
import type { collectionListSection as CollectionListSectionData } from '@/data/home';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CollectionListSection = typeof CollectionListSectionData;

interface CollectionListProps {
  section: CollectionListSection;
  collections: ShopCollection[];
}

// ---------------------------------------------------------------------------
// CollectionGridItem — design-system version of snippets/collection-grid-item.liquid
// (carousel context with image_style === 'circle').
//
// Probed card layout:
//   - White card, border-radius 20px, padding 40px 20px
//   - Image: 120×120 circle (border-radius 50%), centered, margin-bottom 50px (→ mb-[50px])
//   - Title: 22px bold, letter-spacing 1px, line-height 22px, centered
// ---------------------------------------------------------------------------

function CollectionGridItem({ collection }: { collection: ShopCollection }) {
  const img = collection.image;
  const href = (collection.url || '#') as `/${string}`;

  return (
    // White card — radius 20, vertical padding 40px, horizontal 20px (matches probe: padding 40px 20px)
    <Card className="flex flex-col items-center py-[40px] px-[20px] text-center">
      <Link href={href} aria-label={collection.title} className="block w-full">
        {/* Circle image wrapper: 120×120, centered */}
        <div className="mx-auto mb-[50px] size-[120px] overflow-hidden rounded-full">
          {img ? (
            <Image
              src={imageUrl(img.src, 535)}
              sizes="(min-width: 750px) calc(100vw / 5), 100vw"
              width={120}
              height={120}
              loading="lazy"
              alt={img.alt || collection.title}
              className="size-full object-cover"
            />
          ) : (
            // No image — render the circle as an empty grey placeholder
            <div className="size-full bg-[#f4f4f4]" />
          )}
        </div>
      </Link>

      {/* Title — 22px bold, letter-spacing 1px (text-h4 maps to 22px; add tracking override) */}
      <Link href={href} className="block hover:text-primary">
        <Heading
          as="h3"
          level={4}
          className="text-center font-bold leading-[1.1] tracking-[1px]"
        >
          {collection.title || 'Колекция'}
        </Heading>
      </Link>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// CollectionList — the carousel/circle mode.
//
// Layout from mirror HTML (index.html lines 11817–11936):
//   section[bg-page] → Container → section-header row (title + CTA btn left, arrows right)
//                                → scroll-snap track of tiles (~5 per row, flex-basis ~20%)
// ---------------------------------------------------------------------------

export function CollectionList({ section, collections }: CollectionListProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = collections.length;

  // Scroll the track to bring the target slide into view (wraps around).
  const scrollTo = useCallback(
    (index: number) => {
      const el = sliderRef.current;
      if (!el) return;

      const next = ((index % total) + total) % total;
      setCurrentIndex(next);

      const slideWidth = el.scrollWidth / total;
      el.scrollTo({ left: slideWidth * next, behavior: 'smooth' });
    },
    [total],
  );

  const handlePrev = () => scrollTo(currentIndex - 1);
  const handleNext = () => scrollTo(currentIndex + 1);

  return (
    // Section band: bg-page (#f4f4f4), vertical rhythm py-10 md:py-14 from Section
    <Section
      data-section-type="collection-list"
      className="bg-page"
    >
      <Container>
        {/* ── Section header ──────────────────────────────────────────────────
            Live: .section-header with padding 0 55px, margin-bottom 55px.
            Container already provides px-5 md:px-[55px], so we only need mb.
            Row: title+CTA on the left, arrows on the right.
        ─────────────────────────────────────────────────────────────────── */}
        <div className="mb-[55px] flex items-end justify-between">
          {/* Left: eyebrow subtitle (if any), big title, CTA button.
              ~65px breathing space between the mega-title and the CTA, matching live. */}
          <div className="flex flex-col items-start gap-[65px]">
            {section.subtitle ? (
              <Text
                as="span"
                size="eyebrow"
                weight="bold"
                color="primary"
                className="tracking-[0.5px]"
                value={section.subtitle}
              />
            ) : null}

            {section.title ? (
              // .mega-title--large: 100px / 700 — not in the Heading ladder; use custom size.
              // Closest semantic: h2 tag. We override the size with a literal class.
              <Heading
                as="h2"
                level={2}
                className="text-[52px] leading-[1] md:text-[100px]"
              >
                {section.title}
              </Heading>
            ) : null}

            {section.buttonText ? (
              // Primary pill CTA — Button asChild renders the pill onto a Link
              <Button variant="primary" asChild>
                <Link href={section.link as `/${string}`}>
                  <Text as="span" weight="bold" color="white" value={section.buttonText} />
                  <Icon name="tail-right" className="size-4 shrink-0" />
                </Link>
              </Button>
            ) : null}
          </div>

          {/* Right: prev/next circle arrows
              Probed: white bg, border-radius 50%, color #8d8d8d (grey), margin 10px each.
              Button size="circle" gives size-11 rounded-full, but color is grey not primary.
              We use Button variant="white" size="circle" (white bg, ink colour → override to grey).
          */}
          <div className="flex shrink-0 items-center gap-[10px] pt-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={handlePrev}
              className={cn(
                'flex size-11 cursor-pointer items-center justify-center rounded-full',
                'bg-white text-[#8d8d8d] transition-colors hover:text-ink',
              )}
            >
              <Icon name="tail-left" className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={handleNext}
              className={cn(
                'flex size-11 cursor-pointer items-center justify-center rounded-full',
                'bg-white text-[#8d8d8d] transition-colors hover:text-ink',
              )}
            >
              <Icon name="tail-right" className="size-4" />
            </button>
          </div>
        </div>

        {/* ── Slider track ────────────────────────────────────────────────────
            ~5 tiles per row at desktop (flex-basis ~20%).
            Overflow-x scroll with scroll-snap; no scrollbar.
            Each tile: min-w-[20%] on md, full width on mobile (min-w-full or min-w-[80%]).
        ─────────────────────────────────────────────────────────────────── */}
        <div
          ref={sliderRef}
          className="flex gap-[11px] overflow-x-auto"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        >
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="min-w-[80%] shrink-0 sm:min-w-[calc(50%-6px)] md:min-w-[calc(20%-9px)]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <CollectionGridItem collection={collection} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

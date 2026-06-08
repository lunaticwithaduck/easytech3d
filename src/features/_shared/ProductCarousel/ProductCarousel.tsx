'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Button } from '@/design-system/primitives/Button/Button';
import type { ProductCardData } from '@/server/catalog/types';
import { ProductCard } from '../ProductCard/ProductCard';
import {
  carouselArrowIconClass,
  carouselArrowsClass,
  carouselArrowVariants,
  carouselDotItemClass,
  carouselDotsClass,
  carouselDotVariants,
  carouselItemClass,
  carouselPanelClass,
  carouselRootClass,
  carouselTrackClass,
} from './ProductCarousel.styles';

export type ProductCarouselProps = {
  products: ProductCardData[];
  /**
   * Autoplay interval in ms (Flickity `autoPlay: cycle_speed*1000`). Omit/false to disable.
   * Real home sections run 4000–5000ms; pauses while the pointer is over the track
   * (`pauseAutoPlayOnHover: true`).
   */
  autoPlay?: number | false;
  className?: string;
};

// Cards shown per page on desktop — Flickity `groupCells: grid` where grid = 4 (4-up, one-quarter
// cells). On mobile the carousel is a plain horizontal scroll (Flickity `watchCSS` disables it),
// so paging math only drives the desktop dots/arrows.
const CELLS_PER_PAGE = 4;

/**
 * Faithful port of the featured-products carousel (`sections/featured-products.liquid`).
 * Flickity semantics — `{ prevNextButtons:false, wrapAround:true, cellAlign:left, groupCells:4,
 * pageDots, autoPlay }` — reproduced with CSS scroll-snap + a ref that scrolls one page. Renders
 * <ProductCard> cells inside the theme's `.index-tabs-content_block__slider` track, with the
 * 65×4px page dots and the `.btn--circle-arrow` (44px) custom prev/next buttons.
 */
export function ProductCarousel({ products, autoPlay = false, className }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  // Number of pages = ceil(cells / 4) on desktop. (Mobile shows them as a free scroll; the dots
  // are desktop-only, so this page model matches the visible paging there.)
  const pageCount = Math.max(1, Math.ceil(products.length / CELLS_PER_PAGE));

  // Scroll the track to a given page index, wrapping around (Flickity `wrapAround: true`).
  const goToPage = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;
      const wrapped = ((target % pageCount) + pageCount) % pageCount;
      const pageWidth = track.clientWidth;
      track.scrollTo({ left: pageWidth * wrapped, behavior: 'smooth' });
      setPage(wrapped);
    },
    [pageCount],
  );

  const next = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const previous = useCallback(() => goToPage(page - 1), [goToPage, page]);

  // Keep the active dot in sync when the user drags/native-scrolls the track.
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const pageWidth = track.clientWidth || 1;
    setPage(Math.round(track.scrollLeft / pageWidth));
  }, []);

  // Autoplay (Flickity `autoPlay`), paused on hover (`pauseAutoPlayOnHover: true`).
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!autoPlay || paused || pageCount <= 1) return;
    const id = window.setInterval(() => goToPage(page + 1), autoPlay);
    return () => window.clearInterval(id);
  }, [autoPlay, paused, pageCount, page, goToPage]);

  if (products.length === 0) return null;

  return (
    <div className={cn(carouselRootClass, className)}>
      <div className={carouselPanelClass}>
        {/* .slider_custom_arrows — custom prev/next circle-arrow buttons (theme: prevNextButtons:false) */}
        <div className={carouselArrowsClass}>
          <Button asChild variant="circle-arrow" aria-label="Previous" className={carouselArrowVariants({ direction: 'prev' })}>
            <button type="button" onClick={previous}>
              {/* icon 'tail-left' (snippets/icon.liquid, viewBox 0 0 24 24, currentColor) */}
              <svg viewBox="0 0 24 24" className={carouselArrowIconClass} role="presentation" aria-hidden>
                <path
                  fill="currentColor"
                  d="M1.293 11.293L9 3.586 10.414 5l-6 6H22c.553 0 1 .448 1 1s-.447 1-1 1H4.414l6 6L9 20.414l-7.707-7.707c-.391-.391-.391-1.023 0-1.414z"
                />
              </svg>
            </button>
          </Button>
          <Button asChild variant="circle-arrow" aria-label="Next" className={carouselArrowVariants({ direction: 'next' })}>
            <button type="button" onClick={next}>
              {/* icon 'tail-right' (snippets/icon.liquid, viewBox 0 0 24 24, currentColor) */}
              <svg viewBox="0 0 24 24" className={carouselArrowIconClass} role="presentation" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.707 11.293L15 3.586 13.586 5l6 6H2c-.553 0-1 .448-1 1s.447 1 1 1h17.586l-6 6L15 20.414l7.707-7.707c.391-.391.391-1.023 0-1.414z"
                />
              </svg>
            </button>
          </Button>
        </div>

        {/* .index-tabs-content_block__slider — the scroll-snap track of product-card cells */}
        <div
          ref={trackRef}
          className={carouselTrackClass}
          onScroll={onScroll}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {products.map((product) => (
            <div key={product.id} className={carouselItemClass}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* .flickity-page-dots — one 65×4px dot per page (hidden for slides_1; pageDots) */}
        {pageCount > 1 ? (
          <ol className={carouselDotsClass}>
            {Array.from({ length: pageCount }, (_, i) => (
              <li key={i} className={carouselDotItemClass}>
                <Button asChild unstyled aria-label={`Page ${i + 1}`} aria-current={i === page || undefined}>
                  <button
                    type="button"
                    className={carouselDotVariants({ selected: i === page })}
                    onClick={() => goToPage(i)}
                  />
                </Button>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}

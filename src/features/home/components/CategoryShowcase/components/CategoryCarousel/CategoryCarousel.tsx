'use client';

import { useCallback, useRef, useState } from 'react';
import { routes } from '@/config/routes';
import { TailLeftIcon, TailRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { ImageRef } from '@/server/catalog/types';
import {
  arrowIconClass,
  arrowsClass,
  arrowVariants,
  imageClass,
  imageOverlayClass,
  imageWrapClass,
  infoClass,
  slideClass,
  tileClass,
  tileLinkClass,
  titleClass,
  trackClass,
} from '../../CategoryShowcase.styles';

// Serializable circle tile (resolved from getCollection(handle) on the server).
export type CategoryTile = {
  id: string;
  handle: string;
  title: string;
  image: ImageRef | null;
};

export type CategoryCarouselProps = {
  tiles: CategoryTile[];
};

/**
 * Faithful port of the `collection-list` carousel slider (`sections/collection-list.liquid`,
 * section_style "carousel", image_style "circle"). Flickity config was
 *   { prevNextButtons:false, wrapAround:true, dragThreshold:15, cellAlign:left,
 *     pauseAutoPlayOnHover:true, autoPlay:false, pageDots:false, watchCSS:cond }
 * reproduced with CSS scroll-snap + the custom `.slider_custom_arrows .btn--circle-arrow`
 * prev/next buttons (the live home block has autoplay off, so no autoplay timer here).
 * Each tile is a `.collection-grid-item` (white card) with a 120px circle image + dark overlay
 * and the collection title, linking to routes.collection(handle).
 */
export function CategoryCarousel({ tiles }: CategoryCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  // Scroll the track by one viewport width, wrapping around (Flickity `wrapAround: true`).
  const goToPage = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;
    const pages = Math.max(1, Math.ceil(track.scrollWidth / (track.clientWidth || 1)));
    const wrapped = ((target % pages) + pages) % pages;
    track.scrollTo({ left: (track.clientWidth || 0) * wrapped, behavior: 'smooth' });
    setPage(wrapped);
  }, []);

  const next = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const previous = useCallback(() => goToPage(page - 1), [goToPage, page]);

  if (tiles.length === 0) return null;

  return (
    <>
      {/* .collection-list__slider — the scroll-snap track of circle .collection-grid-item cells */}
      <div ref={trackRef} className={trackClass}>
        {tiles.map((tile) => (
          <div key={tile.id} className={slideClass}>
            <div className={tileClass}>
              <Link
                href={routes.collection(tile.handle)}
                variant="unstyled"
                className={tileLinkClass}
              >
                <span className={imageWrapClass}>
                  {tile.image ? (
                    <Image
                      src={tile.image.url}
                      alt={tile.image.alt || tile.title}
                      fill
                      sizes="(min-width: 1200px) 20vw, (min-width: 750px) 25vw, 85vw"
                      className={imageClass}
                    />
                  ) : null}
                  {/* .collection-grid-item__image-wrapper-overlay (the dark veil over the circle) */}
                  <span className={imageOverlayClass} aria-hidden />
                </span>
              </Link>
              <div className={infoClass}>
                <Text as="h4" className={titleClass}>
                  {tile.title}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* .slider_custom_arrows — custom prev/next circle-arrow buttons (theme prevNextButtons:false) */}
      <div className={arrowsClass}>
        <Button asChild variant="circle-arrow" aria-label="Previous" className={arrowVariants({ direction: 'prev' })}>
          <button type="button" onClick={previous}>
            <TailLeftIcon className={arrowIconClass} aria-hidden />
          </button>
        </Button>
        <Button asChild variant="circle-arrow" aria-label="Next" className={arrowVariants({ direction: 'next' })}>
          <button type="button" onClick={next}>
            <TailRightIcon className={arrowIconClass} aria-hidden />
          </button>
        </Button>
      </div>
    </>
  );
}

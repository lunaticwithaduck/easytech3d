'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import type { ProductCardData } from '@/server/catalog/types';
import { ProductCard } from '../ProductCard/ProductCard';
import {
  carouselArrowVariants,
  carouselItemClass,
  carouselRootClass,
  carouselTrackClass,
} from './ProductCarousel.styles';

export type ProductCarouselProps = {
  products: ProductCardData[];
  className?: string;
};

/**
 * Horizontal CSS scroll-snap row of <ProductCard> (~4 visible on desktop, ~1.2 on
 * mobile) with outline arrow buttons that scroll the track by one card width.
 * No carousel library — overflow-x-auto + snap-x + scrollBy on a ref.
 */
export function ProductCarousel({ products, className }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    // Step one card: first item's width plus the flex gap between items.
    const firstItem = track.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = firstItem ? firstItem.offsetWidth + gap : track.clientWidth;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <div className={cn(carouselRootClass, className)}>
      <Button
        variant="outline"
        aria-label="Предишни продукти"
        className={carouselArrowVariants({ direction: 'prev' })}
        onClick={() => scrollByCard(-1)}
      >
        <Icon icon={ChevronLeft} />
      </Button>

      <div ref={trackRef} className={carouselTrackClass}>
        {products.map((product) => (
          <div key={product.id} className={carouselItemClass}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        aria-label="Следващи продукти"
        className={carouselArrowVariants({ direction: 'next' })}
        onClick={() => scrollByCard(1)}
      >
        <Icon icon={ChevronRight} />
      </Button>
    </div>
  );
}

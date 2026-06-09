'use client';

// Media-gallery half of the PDP — migrated to design-system primitives (no theme classes).
// Faithful to the live `.product-single__media-group`: a square, object-contain main image with the
// other media stacked below as a wrapping thumbnail row (~137px squares, 11px gutter). Clicking a
// thumbnail swaps the active main slide (light client state — the live theme used Flickity, which we
// don't ship). Exact metrics probed on https://easytech3d.com/products/elegoo-pla-red-filament:
//   main media 580×580 (1:1, contained) · thumbnails-block 148px / image 137px / 11px gutter / 2px top.

import { useState } from 'react';
import { Image, cn } from '@/design-system';
import { imageUrl } from '@/lib/shopify/image';
import type { ShopImage } from '@/lib/shopify/types';

export function ProductMedia({
  media,
  title,
  initialIndex = 0,
}: {
  media: ShopImage[];
  title: string;
  initialIndex?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const showThumbnails = media.length > 1;
  const active = media[activeIndex] ?? media[0];

  return (
    <div>
      {/* ── main media (square, contained) ─────────────────────────────────── */}
      <div className="relative aspect-square w-full overflow-hidden rounded-media">
        {active && (
          <Image
            src={imageUrl(active.src, 1066)}
            alt={active.alt || title}
            fill
            sizes="(min-width: 750px) 600px, 100vw"
            priority={activeIndex === 0}
            className="object-contain"
          />
        )}
      </div>

      {/* ── thumbnail row (wrapping, 11px gutter) ──────────────────────────── */}
      {showThumbnails && (
        <div className="mt-2 flex flex-wrap gap-[11px]">
          {media.map((image, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Изображение ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative size-[137px] overflow-hidden rounded-media border transition-colors',
                index === activeIndex ? 'border-ink' : 'border-border hover:border-ink/50',
              )}
            >
              <Image
                src={imageUrl(image.src, 400)}
                alt={image.alt || title}
                fill
                sizes="137px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { ZoomIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Image } from '@/design-system/primitives/Image/Image';
import type { ImageRef } from '@/server/catalog/types';
import {
  galleryRootClass,
  mainImageClass,
  mainStageClass,
  thumbButtonVariants,
  thumbImageClass,
  thumbsGridClass,
  zoomButtonClass,
  zoomIconClass,
} from './ProductGallery.styles';

export type ProductGalleryProps = {
  images: ImageRef[];
  title: string;
};

// 1:1 port of the media group in `sections/product-template.liquid` — the main image carousel stage
// (`.product-single__media__carousel.product_image__zoom`) plus the 4-up thumbnail grid
// (`thumbnails-gallery`, thumbnails_type=grid, size=4). Clicking a thumbnail swaps the active image
// (local index state, mirroring Flickity's `select`); a zoom affordance sits over the main image
// (image zoom is on — the theme opens photoswipe; here it indicates the image is zoomable).
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));
  const active = images[safeIndex];

  if (!active) return null;

  return (
    <div className={galleryRootClass}>
      <div className={mainStageClass}>
        <Image
          src={active.url}
          alt={active.alt || title}
          fill
          sizes="(min-width: 750px) 50vw, 100vw"
          className={mainImageClass}
          priority
        />
        {/* image zoom on — a zoom affordance over the main image (theme: photoswipe trigger). */}
        <Button unstyled className={zoomButtonClass} aria-label="Увеличи изображението">
          <ZoomIcon className={zoomIconClass} />
        </Button>
      </div>

      {images.length > 1 ? (
        <div className={thumbsGridClass}>
          {images.map((image, index) => (
            <Button
              key={`${image.url}-${index}`}
              unstyled
              className={thumbButtonVariants({ active: index === safeIndex })}
              aria-label={`${title} — изображение ${index + 1}`}
              aria-pressed={index === safeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || title}
                fill
                sizes="120px"
                className={thumbImageClass}
              />
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Image } from '@/design-system/primitives/Image/Image';
import type { ImageRef } from '@/server/catalog/types';
import {
  galleryRootClass,
  mainImageClass,
  mainImageWrapClass,
  thumbButtonVariants,
  thumbImageClass,
  thumbStripClass,
} from './ProductGallery.styles';

export type ProductGalleryProps = {
  images: ImageRef[];
  title: string;
};

// Interactive media gallery: a large active image plus a thumbnail strip. Clicking a thumbnail
// swaps the main image (local index state). Mirrors the Liquid product media carousel + thumbnails.
export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));
  const active = images[safeIndex];

  if (!active) return null;

  return (
    <div className={galleryRootClass}>
      <div className={mainImageWrapClass}>
        <Image
          src={active.url}
          alt={active.alt || title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={mainImageClass}
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className={thumbStripClass}>
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
                sizes="80px"
                className={thumbImageClass}
              />
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

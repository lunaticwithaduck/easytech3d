'use client';

// Translation of the media-gallery half of sections/product-template.liquid
// (the `.product-single__media-group` column + snippets/media.liquid + snippets/thumbnails-gallery.liquid).
//
// The live theme drives this with Flickity. We don't ship Flickity: we reproduce the exact markup
// and verbatim class names (so the theme CSS styles it), and add a light React state so clicking a
// thumbnail swaps the active main slide. Class lists / attributes verified against the rendered
// ground truth:
//   tools/output/reference/mirror/products/elegoo-pla-red-filament/index.html (lines 1721-1862)

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { imageUrl, imageSrcset } from '@/lib/shopify/image';
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

  return (
    <div
      className="grid__item product-single__media-group medium-up--one-half"
      data-product-single-media-group=""
    >
      <div
        className="product-single__media__carousel product_image__zoom"
        data-product-main-slider=""
      >
        {media.map((image, index) => {
          // padding-top = (height / width) * 100  (snippets/media.liquid aspect-ratio box)
          const paddingTop = `${(image.height / image.width) * 100}%`;
          return (
            <div
              key={index}
              className={cn(
                'product-single__media__slide',
                index === activeIndex && 'is-selected',
              )}
              data-media-index={index}
              aria-hidden={index === activeIndex ? undefined : 'true'}
            >
              <div
                className="product-single__media-wrapper js"
                product-image-media=""
                data-product-single-media-wrapper=""
              >
                <div
                  style={{ paddingTop }}
                  className="product-single__media image_type  product-single__media--has-thumbnails"
                  data-image-width={image.width}
                  data-image-height={image.height}
                >
                  <img
                    className="feature-row__image product-featured-media"
                    srcSet={imageSrcset(image.src, image.width)}
                    src={imageUrl(image.src, 535)}
                    sizes="(min-width: 750px) 600px
                    , 100vw"
                    loading="lazy"
                    width={image.width}
                    height={image.height}
                    alt={image.alt || title}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showThumbnails && (
        <div className="thumbnails-wrapper">
          <div className="product-single__thumbnails  thumbnails-grid  ">
            {media.map((image, index) => (
              <div
                key={index}
                className={cn(
                  'product-single__thumbnails-block',
                  index === activeIndex && 'active',
                )}
                data-thumb-index={index}
                product-image-media=""
                onClick={() => setActiveIndex(index)}
              >
                <div className="thumbnails-block_wrapper">
                  <img
                    className="product-single__thumbnail-image"
                    src={imageUrl(image.src, 400)}
                    srcSet={`${imageUrl(image.src, 400)} 1x, ${imageUrl(image.src, 800)} 2x`}
                    loading="lazy"
                    width={image.width}
                    height={image.height}
                    alt={`Load image into Gallery viewer, ${image.alt || title}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

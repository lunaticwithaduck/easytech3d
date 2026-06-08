import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Image } from '@/design-system/primitives/Image/Image';
import { Container } from '@/features/_shared/Container/Container';
import type { ImageRef } from '@/server/catalog/types';
import {
  bannerContentVariants,
  bannerImageVariants,
  bannerInnerVariants,
  bannerMediaVariants,
  bannerOverlayVariants,
  bannerTitleVariants,
  bannerVariants,
} from './PageBanner.styles';

export type PageBannerProps = {
  /** Header / featured image filling the band (Liquid `custom_page_header` `image`). */
  image: ImageRef;
  /** The H1 banner heading (`.page_header_heading.h2`). */
  heading: string;
  /**
   * `#000` overlay opacity (0–100), the theme's `image_overlay_opacity` — 40 on blog/article.
   * Passed at runtime via a CSS custom property (the sanctioned dynamic-value escape).
   */
  overlayOpacity?: number;
  /** Breadcrumb trail + any meta (date/author) rendered under the heading, inside `.page-width`. */
  children?: ReactNode;
};

// 1:1 port of `snippets/custom_page_header.liquid`: a full-bleed banner with the header image, a
// `#000` scrim at the configured opacity, and the title (+ breadcrumbs/meta) overlaid bottom-left
// inside the page width. Used by the blog index and the article hero. The header chrome already
// absolutely-positions `#shopify-section-header` over this band (handled by the layout shell).
export function PageBanner({ image, heading, overlayOpacity = 40, children }: PageBannerProps) {
  return (
    <div className={bannerVariants()}>
      <div className={bannerMediaVariants()}>
        <Image
          src={image.url}
          alt={image.alt || heading}
          fill
          sizes="100vw"
          priority
          className={bannerImageVariants()}
        />
      </div>

      {/* Dynamic per-section overlay opacity → CSS custom property (the sanctioned R1 escape). */}
      <div
        aria-hidden
        className={bannerOverlayVariants()}
        style={{ '--overlay-opacity': overlayOpacity / 100 } as CSSProperties}
      />

      <Container className={bannerContentVariants()}>
        <div className={bannerInnerVariants()}>
          <Heading as="h1" level="h2" className={cn('text-inverse', bannerTitleVariants())}>
            {heading}
          </Heading>
          {children}
        </div>
      </Container>
    </div>
  );
}

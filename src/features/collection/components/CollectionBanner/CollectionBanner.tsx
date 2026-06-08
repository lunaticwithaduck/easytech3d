import type { CSSProperties, ReactNode } from 'react';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Image } from '@/design-system/primitives/Image/Image';
import { Text } from '@/design-system/primitives/Text/Text';
import { type BreadcrumbItem, Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import type { ImageRef } from '@/server/catalog/types';
import { formatProductCount } from '../../utils/count.utils';
import {
  bannerBreadcrumbsVariants,
  bannerContentVariants,
  bannerCountVariants,
  bannerImageVariants,
  bannerOverlayVariants,
  bannerTitleBlockVariants,
  bannerTitleVariants,
  bannerVariants,
} from './CollectionBanner.styles';

// Overlay opacity for the banner scrim — `image_overlay_color: #000`, `image_overlay_opacity: 40`
// (collection.json settings). Passed to CSS as a 0–1 decimal via the `--overlay-opacity` property.
const OVERLAY_OPACITY = 0.4;

export type CollectionBannerProps = {
  image: ImageRef;
  title: string;
  /** Product count shown beside the title (`.filters-toolbar__product-count`). */
  count: number;
  breadcrumbs: BreadcrumbItem[];
  /** The filters toolbar (sort + grid/list toggle), overlaid in the banner. */
  toolbar?: ReactNode;
};

/**
 * CollectionBanner — 1:1 port of `snippets/custom_page_header.liquid` rendered in `banner` mode by
 * `collection-template.liquid` (collection_image_mode: 'banner', the live store's setting):
 *
 *   <div class="custom_page_header_section">
 *     <img ... object-position:focal />            (the collection.image, object-fit:cover, 500px well)
 *     <div class="custom_page_header_opacity"></div>   (#000 @ 40% overlay)
 *     <div class="page-width">
 *       <h1 class="h2 page_header_heading">{collection.title}</h1>
 *       {breadcrumbs}                              (Начало › … trail)
 *       <div class="custom_header-filters-toolbar-block">{filters toolbar}</div>
 *     </div>
 *   </div>
 *
 * The title + breadcrumbs read white over the dark scrim. The toolbar (grid/list toggle + sort) is
 * passed in as `toolbar` so the count/sort island stays its own component.
 */
export function CollectionBanner({
  image,
  title,
  count,
  breadcrumbs,
  toolbar,
}: CollectionBannerProps) {
  return (
    <div className={bannerVariants()}>
      <Image
        src={image.url}
        alt={image.alt || title}
        fill
        sizes="100vw"
        priority
        className={bannerImageVariants()}
      />
      {/* Per-record overlay opacity (R1 escape) → `.custom_page_header_opacity { opacity:{N}% }`. */}
      <span
        className={bannerOverlayVariants()}
        style={{ '--overlay-opacity': OVERLAY_OPACITY } as CSSProperties}
        aria-hidden
      />

      <div className={bannerContentVariants()}>
        <Breadcrumbs items={breadcrumbs} className={bannerBreadcrumbsVariants()} />
        <div className={bannerTitleBlockVariants()}>
          <Heading as="h1" level="h2" className={bannerTitleVariants()}>
            {title}
          </Heading>
          <Text as="span" className={bannerCountVariants()}>
            {formatProductCount(count)}
          </Text>
        </div>
        {toolbar}
      </div>
    </div>
  );
}

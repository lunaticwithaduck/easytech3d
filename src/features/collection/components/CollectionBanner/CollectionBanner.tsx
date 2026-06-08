import { Image } from '@/design-system/primitives/Image/Image';
import { Text } from '@/design-system/primitives/Text/Text';
import type { ImageRef } from '@/server/catalog/types';
import {
  bannerImageVariants,
  bannerOverlayVariants,
  bannerTitleVariants,
  bannerVariants,
} from './CollectionBanner.styles';

export type CollectionBannerProps = {
  image: ImageRef;
  title: string;
};

// Hero band shown when a collection has a banner image: the photo fills the well, a dark scrim
// improves contrast, and the collection title sits centered on top in inverse (white) text.
// Mirrors the Liquid `custom_page_header` banner (collection_image_mode: banner).
export function CollectionBanner({ image, title }: CollectionBannerProps) {
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
      <span className={bannerOverlayVariants()} aria-hidden />
      <Text as="h1" size="4xl" weight="bold" color="inverse" className={bannerTitleVariants()}>
        {title}
      </Text>
    </div>
  );
}

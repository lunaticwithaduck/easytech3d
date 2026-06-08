import { routes } from '@/config/routes';
import { TailRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { formatCollectionProductsCount } from '@/features/collection/utils/count.utils';
import type { Collection } from '@/server/catalog/types';
import {
  buttonIconClass,
  buttonVariants,
  buttonWrapperVariants,
  cardVariants,
  countVariants,
  imageVariants,
  infoVariants,
  mediaVariants,
  titleVariants,
} from './CollectionCard.styles';

export type CollectionCardProps = {
  collection: Collection;
};

// 1:1 port of `snippets/collections-grid-item.liquid` (full_image display, list-collections page):
//   <div class="collection-grid-item full_image">
//     <div class="collection-grid-item__image-with-placeholder-wrapper">
//       <a class="collection-grid-item__link"><div class="collection-grid-item__image-wrapper">
//         <img class="zoom-fade-animation-element"></div></a>
//     </div>
//     <div class="collection-grid-item__info collections-grid-item__info">
//       <div class="collection-grid-item__title h3"><a>{collection.title}</a></div>
//       <div class="collection-grid-item-products-count"><span>{N} продукти</span></div>
//       <div class="collection-grid-item__button_wrapper">
//         <a class="btn btn--secondary"><span>Разгледай</span>{tail-right}</a>
//       </div>
//     </div>
//   </div>
export function CollectionCard({ collection }: CollectionCardProps) {
  const href = routes.collection(collection.handle);

  return (
    <div className={cardVariants()}>
      <Link
        href={href}
        variant="unstyled"
        aria-label={collection.title}
        className={mediaVariants()}
      >
        {collection.image ? (
          <Image
            src={collection.image.url}
            alt={collection.image.alt || collection.title}
            fill
            sizes="(min-width: 750px) 33vw, 50vw"
            className={imageVariants()}
          />
        ) : null}
      </Link>

      <div className={infoVariants()}>
        <Heading as="h3" level="h3" className={titleVariants()}>
          <Link href={href} variant="unstyled">
            {collection.title}
          </Link>
        </Heading>

        <Text as="span" className={countVariants()}>
          {formatCollectionProductsCount(collection.productCount)}
        </Text>

        <div className={buttonWrapperVariants()}>
          <Button asChild variant="secondary" className={buttonVariants()}>
            <Link href={href} variant="unstyled">
              <Text as="span" size="2xs" weight="bold" color="current" value="Разгледай" />
              <TailRightIcon className={buttonIconClass} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { ArrowRight } from 'lucide-react';
import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { formatProductCount } from '@/features/collection/utils/count.utils';
import type { Collection } from '@/server/catalog/types';
import {
  cardVariants,
  imageVariants,
  infoVariants,
  mediaVariants,
  pillVariants,
  titleVariants,
} from './CollectionCard.styles';

export type CollectionCardProps = {
  collection: Collection;
};

// A single tile in the collections index grid: the collection image, its title and product count,
// and a "Разгледай" browse pill — the whole card links to the collection page. Mirrors the
// list-collections template's image + title + count card.
export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Button asChild unstyled className={cardVariants()}>
      <Link href={routes.collection(collection.handle)} variant="unstyled">
        <span className={mediaVariants()}>
          {collection.image ? (
            <Image
              src={collection.image.url}
              alt={collection.image.alt || collection.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={imageVariants()}
            />
          ) : null}
        </span>
        <span className={infoVariants()}>
          <Text as="h3" size="lg" weight="semibold" className={titleVariants()}>
            {collection.title}
          </Text>
          <Text as="span" size="sm" color="muted">
            {formatProductCount(collection.productCount)}
          </Text>
        </span>
        <span className={pillVariants()}>
          <Text as="span" size="sm" weight="medium" color="current" value="Разгледай" />
          <Icon icon={ArrowRight} size={16} />
        </span>
      </Link>
    </Button>
  );
}

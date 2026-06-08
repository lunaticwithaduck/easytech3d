import { ShoppingCart } from 'lucide-react';
import { routes } from '@/config/routes';
import { cn } from '@/design-system/lib/cn';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { PriceTag } from '@/features/_shared/PriceTag/PriceTag';
import type { ProductCardData } from '@/server/catalog/types';
import {
  actionsClass,
  addButtonClass,
  cardLinkClass,
  cardVariants,
  imageVariants,
  infoVariants,
  mediaVariants,
  saleBadgeVariants,
  titleVariants,
} from './ProductCard.styles';

export type ProductCardProps = {
  product: ProductCardData;
  className?: string | undefined;
};

// Grid tile for a single product. The media + info area links to the product page; a pink
// "Добави в количката" action sits pinned at the bottom (a sibling link, not nested, so the
// markup stays valid) — matching the reference's product-card grid and the Liquid card snippet.
export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <div className={cn(cardVariants(), className)}>
      <Link href={routes.product(product.handle)} variant="unstyled" className={cardLinkClass}>
        <span className={mediaVariants()}>
          {product.onSale ? (
            <Text
              as="span"
              size="2xs"
              weight="semibold"
              color="inverse"
              className={saleBadgeVariants()}
              value="Промоция"
            />
          ) : null}
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.alt || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={imageVariants()}
          />
        </span>
        <span className={infoVariants()}>
          <Text as="h3" size="sm" weight="medium" className={titleVariants()}>
            {product.title}
          </Text>
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
        </span>
      </Link>
      <div className={actionsClass}>
        <Button asChild variant="primary" size="sm" className={addButtonClass}>
          <Link href={routes.product(product.handle)} variant="unstyled">
            <Icon icon={ShoppingCart} size={16} />
            <Text as="span" color="current" weight="medium" value="Добави в количката" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

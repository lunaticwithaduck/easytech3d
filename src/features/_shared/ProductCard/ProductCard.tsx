import { routes } from '@/config/routes';
import { cn } from '@/design-system/lib/cn';
import { Button } from '@/design-system/primitives/Button/Button';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { PriceTag } from '@/features/_shared/PriceTag/PriceTag';
import type { ProductCardData } from '@/server/catalog/types';
import {
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

// Grid tile for a single product. The whole surface is one link to the product page (rendered via
// `<Button asChild unstyled>` so it keeps button semantics while the card owns its styling). Inside:
// a square featured image, the title, and the price row; an "Промоция" flag overlays the media when
// the product is on sale. Matches the reference's product-card grid and the Liquid card snippet.
export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Button asChild unstyled className={cn(cardVariants(), className)}>
      <Link href={routes.product(product.handle)} variant="unstyled">
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
    </Button>
  );
}

import { routes } from '@/config/routes';
import { cn } from '@/design-system/lib/cn';
import { CartIcon } from '@/design-system/icons';
import { buttonVariants } from '@/design-system/primitives/Button/Button.styles';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { PriceTag } from '@/features/_shared/PriceTag/PriceTag';
import type { ProductCardData } from '@/server/catalog/types';
import { ProductCardSwatches } from './components/ProductCardSwatches/ProductCardSwatches';
import { ProductLabelList } from './components/ProductLabelList/ProductLabelList';
import {
  actionListClass,
  addButtonClass,
  blockClass,
  cardVariants,
  cartIconClass,
  imageBoxClass,
  imageClass,
  imageLinkClass,
  imageWrapperClass,
  infoClass,
  mediaClass,
  priceRowClass,
  titleClass,
  titleLinkClass,
  vendorClass,
} from './ProductCard.styles';

export type ProductCardProps = {
  product: ProductCardData;
  className?: string | undefined;
};

// Percentage savings for the sale label, mirroring the theme's `discount_mode == 'percentage'`
// capture: `(compare_at - price) * 100 / compare_at | round`.
function computeSavings(price: number, compareAt: number): string {
  return `${Math.round(((compareAt - price) * 100) / compareAt)}%`;
}

/**
 * ProductCard — faithful 1:1 port of `snippets/product-card-item.liquid` (+ theme.css §7–9).
 *
 * DOM/semantics reproduced:
 *   .product-item-block (mb 30px)
 *     └ .product-card  (white #fff, radius 20px, padding 20px, flex-col, h-100%, position:relative)
 *        ├ .product-item__label-list   (absolute top-left: sale GREEN / sold-out grey pills)
 *        ├ .product-item--media
 *        │   ├ a.product-card__link-image > .product-card__image-wrapper > img  (200px box, contain, mb 15px)
 *        │   └ .product-item__swatches  (absolute top-right: 18px color circles)
 *        └ .product-item--info
 *            ├ a.product-item__vendor
 *            ├ a.product-card__link-title > span.h4.product-card__title
 *            ├ .product-item__price_and_reviews_row  (PriceTag, dual лв/€)
 *            └ form.product-item__action-list (margin-top:auto) > .btn--primary "Добави в количката" + cart
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const productHref = routes.product(product.handle);
  const onSale = product.onSale && product.compareAtPrice != null;
  const savings =
    onSale && product.compareAtPrice
      ? computeSavings(product.price.amount, product.compareAtPrice.amount)
      : undefined;
  const soldOut = !product.available;

  return (
    <div className={cn(blockClass, className)}>
      <div className={cardVariants()} data-sold-out={soldOut ? '' : undefined}>
        <ProductLabelList onSale={onSale} savings={savings} soldOut={soldOut} />

        <div className={mediaClass}>
          <div className={imageBoxClass}>
            <Link
              href={productHref}
              variant="unstyled"
              aria-label={product.title}
              className={imageLinkClass}
            >
              <span className={imageWrapperClass}>
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.alt || product.title}
                  fill
                  sizes="(min-width: 750px) 25vw, 50vw"
                  className={imageClass}
                />
              </span>
            </Link>
          </div>

          <ProductCardSwatches />
        </div>

        <div className={infoClass}>
          {product.vendor ? (
            <Link href={productHref} variant="unstyled" className={vendorClass}>
              {product.vendor}
            </Link>
          ) : null}

          <Link
            href={productHref}
            variant="unstyled"
            aria-label={product.title}
            className={titleLinkClass}
          >
            <Text as="span" className={titleClass}>
              {product.title}
            </Text>
          </Link>

          <div className={priceRowClass}>
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
          </div>

          <div className={actionListClass}>
            {/* Card CTA is a styled Link (the .btn--primary pill applied directly) rather than
                <Button asChild>, avoiding Radix Slot fragility when slotting onto the Link. */}
            <Link
              href={routes.cart}
              variant="unstyled"
              className={cn(buttonVariants({ variant: 'primary' }), addButtonClass)}
            >
              <Text as="span" size="2xs" weight="bold" color="current" value="Добави в количката" />
              <CartIcon className={cartIconClass} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

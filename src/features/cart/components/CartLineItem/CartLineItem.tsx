'use client';

import { routes } from '@/config/routes';
import { CloseIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { PriceTag } from '@/features/_shared/PriceTag/PriceTag';
import type { CartLineItem as CartLineItemType } from '../../config/constants';
import { CART_COPY } from '../../config/constants';
import { lineTotal } from '../../utils/cart.utils';
import { QuantityStepper } from '../QuantityStepper/QuantityStepper';
import {
  mobileLabelClass,
  mobileRemoveClass,
  productCellClass,
  productInfoClass,
  productTitleClass,
  quantityCellClass,
  removeButtonClass,
  removeCellClass,
  removeIconClass,
  rowClass,
  thumbnailClass,
  thumbnailImageClass,
  totalCellClass,
  variantClass,
} from './CartLineItem.styles';

export type CartLineItemProps = {
  item: CartLineItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

// A single `.CartItem` row: thumbnail + title (links to the product) + variant, the `QuantitySelector`
// pill, the dual лв/€ line total, and the close (×) remove control. All handlers are passed in by the
// parent (stub-wired; no backend this session).
export function CartLineItem({ item, onQuantityChange, onRemove }: CartLineItemProps) {
  const { product, variantLabel, quantity } = item;
  const total = lineTotal(item);

  return (
    <div className={rowClass}>
      <div className={productCellClass}>
        <Link href={routes.product(product.handle)} variant="unstyled" className={thumbnailClass}>
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.alt || product.title}
            fill
            sizes="120px"
            className={thumbnailImageClass}
          />
        </Link>

        <div className={productInfoClass}>
          <Link href={routes.product(product.handle)} variant="unstyled">
            <Text as="h5" size="base" weight="normal" className={productTitleClass}>
              {product.title}
            </Text>
          </Link>
          <Text as="span" size="sm" color="muted" className={variantClass}>
            {variantLabel}
          </Text>

          <Button
            variant="ghost"
            unstyled
            className={mobileRemoveClass}
            aria-label={CART_COPY.removeItem}
            onClick={onRemove}
          >
            <CloseIcon className={removeIconClass} />
            <Text as="span" size="xs" color="current" value={CART_COPY.removeItem} />
          </Button>
        </div>
      </div>

      <div className={quantityCellClass}>
        <Text
          as="span"
          size="xs"
          weight="semibold"
          color="muted"
          className={mobileLabelClass}
          value={CART_COPY.columnQuantity}
        />
        <QuantityStepper quantity={quantity} onChange={onQuantityChange} />
      </div>

      <div className={totalCellClass}>
        <Text
          as="span"
          size="xs"
          weight="semibold"
          color="muted"
          className={mobileLabelClass}
          value={CART_COPY.columnTotal}
        />
        <PriceTag price={total} compareAtPrice={product.compareAtPrice} />
      </div>

      <div className={removeCellClass}>
        <Button
          variant="ghost"
          unstyled
          className={removeButtonClass}
          aria-label={CART_COPY.removeItem}
          onClick={onRemove}
        >
          <CloseIcon className={removeIconClass} />
        </Button>
      </div>
    </div>
  );
}

'use client';

import { X } from 'lucide-react';
import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
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
  productCellClass,
  productInfoClass,
  productTitleClass,
  quantityCellClass,
  removeButtonClass,
  rowClass,
  thumbnailClass,
  thumbnailImageClass,
  totalCellClass,
} from './CartLineItem.styles';

export type CartLineItemProps = {
  item: CartLineItemType;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

// A single cart line: thumbnail, title (links to the product), variant label, quantity stepper,
// line total, and a remove control. All handlers are passed in by the parent (stub-wired).
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
            sizes="80px"
            className={thumbnailImageClass}
          />
        </Link>

        <div className={productInfoClass}>
          <Link href={routes.product(product.handle)} variant="default">
            <Text as="span" size="base" weight="medium" className={productTitleClass}>
              {product.title}
            </Text>
          </Link>
          <Text as="span" size="sm" color="muted">
            {variantLabel}
          </Text>

          <Button
            variant="ghost"
            unstyled
            className={removeButtonClass}
            aria-label={CART_COPY.removeItem}
            onClick={onRemove}
          >
            <Icon icon={X} size={14} />
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
    </div>
  );
}

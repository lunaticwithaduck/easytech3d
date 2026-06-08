import type { ComponentProps } from 'react';
import { cn } from '@/design-system/lib/cn';
import { TextPrice } from '@/design-system/primitives/Text/TextPrice';
import type { Money } from '@/server/catalog/types';
import {
  compareAtVariants,
  priceVariants,
  saleGroupVariants,
  salePriceVariants,
} from './PriceTag.styles';

type PriceTagSize = ComponentProps<typeof TextPrice>['size'];

type PriceTagProps = {
  price: Money;
  compareAtPrice?: Money | null;
  size?: PriceTagSize;
  className?: string;
};

// Reproduces the theme's `.price` block (snippets/product-price.liquid):
// - not on sale → `.price__regular > .price-item--regular` (dual "{lev} лв / {euro} €", text color)
// - on sale     → `.price__sale > .price-item--sale` (same dual amount in red #EA0606, mr 10px)
//                 followed by a struck `<s class="price-item--regular">` compare-at, muted.
// The whole row is bold (`.price { font-weight:bold }`). Currency is BGN; the EUR figure is
// computed inside <TextPrice> at the theme's 0.51 ratio.
export function PriceTag({ price, compareAtPrice, size, className }: PriceTagProps) {
  const onSale = compareAtPrice != null && compareAtPrice.amount > price.amount;

  return (
    <span
      className={cn(priceVariants(), className)}
      data-price
      data-on-sale={onSale ? '' : undefined}
    >
      {onSale ? (
        <span className={saleGroupVariants()}>
          <TextPrice
            amount={price.amount}
            currency={price.currencyCode}
            size={size}
            weight="bold"
            color="sale"
            className={salePriceVariants()}
          />
          <s>
            <TextPrice
              amount={compareAtPrice.amount}
              currency={compareAtPrice.currencyCode}
              size={size}
              weight="normal"
              color="muted"
              className={compareAtVariants()}
            />
          </s>
        </span>
      ) : (
        <TextPrice
          amount={price.amount}
          currency={price.currencyCode}
          size={size}
          weight="bold"
          color="text"
        />
      )}
    </span>
  );
}

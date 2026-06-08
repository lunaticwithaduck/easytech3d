import type { ComponentProps } from 'react';
import { cn } from '@/design-system/lib/cn';
import { TextPrice } from '@/design-system/primitives/Text/TextPrice';
import type { Money } from '@/server/catalog/types';
import { compareAtVariants, priceTagVariants } from './PriceTag.styles';

type PriceTagSize = ComponentProps<typeof TextPrice>['size'];

type PriceTagProps = {
  price: Money;
  compareAtPrice?: Money | null;
  size?: PriceTagSize;
  className?: string;
};

// Renders the active price, and when an original `compareAtPrice` is present shows it
// struck-through in muted next to the current price rendered in the `sale` color.
export function PriceTag({ price, compareAtPrice, size, className }: PriceTagProps) {
  const onSale = compareAtPrice != null && compareAtPrice.amount > price.amount;

  return (
    <span className={cn(priceTagVariants(), className)}>
      <TextPrice
        amount={price.amount}
        currency={price.currencyCode}
        size={size}
        weight="semibold"
        color={onSale ? 'sale' : 'text'}
      />
      {onSale ? (
        <TextPrice
          amount={compareAtPrice.amount}
          currency={compareAtPrice.currencyCode}
          size={size}
          weight="normal"
          color="muted"
          className={compareAtVariants()}
        />
      ) : null}
    </span>
  );
}

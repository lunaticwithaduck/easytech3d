import { cn } from '@/design-system/lib/cn';
import { Text } from '@/design-system/primitives/Text/Text';
import { money } from '@/lib/shopify/money';

// EUR price, e.g. "24.90 €". On sale the current price turns red (--color-sale) and the
// compare-at is struck through. Prices are integer cents.
export function Price({
  price,
  compareAtPrice,
  size = 'base',
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: 'base' | 'h5' | 'h4' | 'sm';
  className?: string;
}) {
  const onSale = compareAtPrice != null && compareAtPrice > price;
  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)} data-price>
      <Text
        as="span"
        size={size}
        weight="bold"
        color={onSale ? 'sale' : 'ink'}
        value={money(price)}
      />
      {onSale ? <Text as="s" size="sm" color="muted" value={money(compareAtPrice)} /> : null}
    </div>
  );
}

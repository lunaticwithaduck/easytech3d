import { Text } from '@/design-system/primitives/Text/Text';
import { labelListClass, labelVariants } from './ProductLabelList.styles';

export type ProductLabelListProps = {
  /** Whether the product is on sale (renders the green "На промоция от: {savings}!" pill). */
  onSale: boolean;
  /** Savings string already formatted by the card (e.g. "20%"), per `discount_mode`. */
  savings?: string;
  /** Whether the product is out of stock (renders the grey "Изкупено" pill). */
  soldOut: boolean;
};

// `.product-item__label-list` — absolute top-left stack of outlined label pills, reproducing the
// `product_labels` capture in `snippets/product-card-item.liquid`:
//   - on sale  → `.product-label--on-sale` "На промоция от: {savings}!" (GREEN #00a500 outline)
//   - sold out → `.product-label--soldout` "Изкупено" (grey #8a9297 outline)
// The sale label is green here; the price strike-through (red #EA0606) lives in <PriceTag>.
export function ProductLabelList({ onSale, savings, soldOut }: ProductLabelListProps) {
  if (!onSale && !soldOut) return null;

  return (
    <div className={labelListClass}>
      {onSale ? (
        <Text
          as="span"
          weight="normal"
          color="current"
          className={labelVariants({ tone: 'onSale' })}
          value="На промоция от: {savings}!"
          params={{ savings: savings ?? '' }}
        />
      ) : null}
      {soldOut ? (
        <Text
          as="span"
          weight="normal"
          color="current"
          className={labelVariants({ tone: 'soldOut' })}
          value="Изкупено"
        />
      ) : null}
    </div>
  );
}

import type { Money } from '@/server/catalog/types';
import type { CartLineItem } from '../config/constants';

// Line total = unit price × quantity, returned in the line's own currency.
export function lineTotal(item: CartLineItem): Money {
  return {
    amount: item.product.price.amount * item.quantity,
    currencyCode: item.product.price.currencyCode,
  };
}

// Cart subtotal = sum of every line total. Assumes a single currency across the cart (BGN store),
// so it carries the first line's currency and falls back to BGN for an empty cart.
export function cartSubtotal(items: CartLineItem[]): Money {
  const amount = items.reduce((sum, item) => sum + item.product.price.amount * item.quantity, 0);
  return {
    amount,
    currencyCode: items[0]?.product.price.currencyCode ?? 'BGN',
  };
}

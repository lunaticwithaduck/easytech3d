'use client';

import { useState } from 'react';
import { Text } from '@/design-system/primitives/Text/Text';
import type { CartLineItem as CartLineItemType } from '../../config/constants';
import { CART_COPY } from '../../config/constants';
import { cartSubtotal } from '../../utils/cart.utils';
import { CartLineItem } from '../CartLineItem/CartLineItem';
import { EmptyCart } from '../EmptyCart/EmptyCart';
import { OrderSummary } from '../OrderSummary/OrderSummary';
import {
  cartLayoutClass,
  columnHeaderCenterClass,
  columnHeaderClass,
  columnHeaderProductClass,
  itemListClass,
  lineItemsSideClass,
  sidebarSideClass,
} from './CartContents.styles';

export type CartContentsProps = {
  /** Stub line items seeded from the catalog. */
  initialItems: CartLineItemType[];
};

// Interactive cart body (`form.Cart`). Holds the line-item rows in local state so the quantity
// steppers and the remove control are wired (no backend this session — updates are client-only).
// When the last row is removed the layout swaps to the empty-cart state, so both states are
// reachable in the UI.
export function CartContents({ initialItems }: CartContentsProps) {
  const [items, setItems] = useState<CartLineItemType[]>(initialItems);

  const setQuantity = (id: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className={cartLayoutClass}>
      <div className={lineItemsSideClass}>
        <div className={itemListClass}>
          <div className={columnHeaderClass}>
            <Text
              as="span"
              size="base"
              weight="bold"
              className={columnHeaderProductClass}
              value={CART_COPY.columnProduct}
            />
            <Text
              as="span"
              size="base"
              weight="bold"
              className={columnHeaderCenterClass}
              value={CART_COPY.columnQuantity}
            />
            <Text
              as="span"
              size="base"
              weight="bold"
              className={columnHeaderCenterClass}
              value={CART_COPY.columnTotal}
            />
            <span />
          </div>

          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      </div>

      <div className={sidebarSideClass}>
        <OrderSummary subtotal={cartSubtotal(items)} />
      </div>
    </div>
  );
}

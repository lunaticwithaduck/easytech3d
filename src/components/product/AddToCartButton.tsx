'use client';

import { cartActions, useCartPending } from '@/components/layout/cart-store';
import { Button, Icon, Text } from '@/design-system';

// Client add-to-cart button for product cards. Adds the given variant (the card's default/first
// available variant) to the server cart and opens the drawer.
export function AddToCartButton({
  variantId,
  available,
  label = 'Добави в количката',
}: {
  variantId: string | null;
  available: boolean;
  label?: string;
}) {
  const pending = useCartPending();
  const canAdd = available && Boolean(variantId);
  return (
    <Button
      variant="primary"
      block
      aria-label={label}
      disabled={!canAdd || pending}
      onClick={() => {
        if (variantId) void cartActions.add(variantId, 1);
      }}
    >
      <Text as="span" weight="bold" color="white" value={available ? label : 'Изпродадено'} />
      <Icon name="cart" className="size-[18px] shrink-0" />
    </Button>
  );
}

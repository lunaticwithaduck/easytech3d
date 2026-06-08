'use client';

import { useState } from 'react';
import { CartIcon, MinusIcon, PlusIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Text } from '@/design-system/primitives/Text/Text';
import {
  cartIconClass,
  quantityLabelClass,
  quantityRowClass,
  rootClass,
  stepperButtonClass,
  stepperClass,
  stepperIconClass,
  stepperValueClass,
  submitButtonClass,
  submitRowClass,
} from './AddToCart.styles';

export type AddToCartProps = {
  available: boolean;
};

// 1:1 port of the `quantity_block` + `product_buttons` blocks in `sections/product-template.liquid`.
// A `.QuantitySelector` pill (w120, radius50) with minus/value/plus, followed by the primary
// `.btn--primary` "Добави в количката" CTA (cart icon trailing). On mobile (≤749px) the submit row
// becomes a sticky bottom bar (`enabled_mobile_sticky_btns`). The submit is a no-op stub this
// session — the cart backend is wired next — but the stepper is fully interactive (clamped at 1).
export function AddToCart({ available }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={rootClass}>
      <div className={quantityRowClass}>
        <Text as="span" className={quantityLabelClass} value="Количество:" />
        <div className={stepperClass}>
          <Button
            unstyled
            className={stepperButtonClass}
            aria-label="Намали количеството"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <MinusIcon className={stepperIconClass} />
          </Button>
          <Text as="span" className={stepperValueClass}>
            {String(quantity)}
          </Text>
          <Button
            unstyled
            className={stepperButtonClass}
            aria-label="Увеличи количеството"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <PlusIcon className={stepperIconClass} />
          </Button>
        </div>
      </div>

      <div className={submitRowClass}>
        <Button
          variant="primary"
          className={submitButtonClass}
          disabled={!available}
          onClick={() => {
            /* no-op: cart backend wired next session */
          }}
        >
          <Text
            as="span"
            color="current"
            weight="bold"
            value={available ? 'Добави в количката' : 'Изпродадено'}
          />
          <CartIcon className={cartIconClass} />
        </Button>
      </div>
    </div>
  );
}

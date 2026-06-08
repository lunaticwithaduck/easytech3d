'use client';

import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Text } from '@/design-system/primitives/Text/Text';
import {
  addButtonClass,
  addToCartRootClass,
  quantityRowClass,
  stepperButtonClass,
  stepperClass,
  stepperValueClass,
} from './AddToCart.styles';

export type AddToCartProps = {
  available: boolean;
};

// Quantity stepper + primary "Добави в количката" CTA. The submit is a no-op stub this session —
// the cart backend is wired next — but the stepper is fully interactive (clamped at 1).
export function AddToCart({ available }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={addToCartRootClass}>
      <div className={quantityRowClass}>
        <Text as="span" size="sm" weight="semibold" color="text" value="Количество" />
        <div className={stepperClass}>
          <Button
            unstyled
            className={stepperButtonClass}
            aria-label="Намали количеството"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Icon icon={Minus} size={16} />
          </Button>
          <Text as="span" size="base" weight="semibold" color="text" className={stepperValueClass}>
            {String(quantity)}
          </Text>
          <Button
            unstyled
            className={stepperButtonClass}
            aria-label="Увеличи количеството"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Icon icon={Plus} size={16} />
          </Button>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className={addButtonClass}
        disabled={!available}
        onClick={() => {
          /* no-op: cart backend wired next session */
        }}
      >
        <Icon icon={ShoppingCart} size={18} />
        <Text
          as="span"
          color="current"
          weight="medium"
          value={available ? 'Добави в количката' : 'Изчерпан'}
        />
      </Button>
    </div>
  );
}

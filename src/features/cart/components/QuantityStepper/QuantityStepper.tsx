'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Text } from '@/design-system/primitives/Text/Text';
import { CART_COPY } from '../../config/constants';
import {
  stepperButtonClass,
  stepperRootClass,
  stepperValueClass,
} from './QuantityStepper.styles';

export type QuantityStepperProps = {
  quantity: number;
  /** Called with the requested new quantity; the parent clamps to a minimum of 1. */
  onChange: (quantity: number) => void;
};

// Minus / value / plus segmented control mirroring the Liquid `QuantitySelector`. Stub-wired:
// it calls `onChange` with the next value; clamping/persistence is the parent's concern.
export function QuantityStepper({ quantity, onChange }: QuantityStepperProps) {
  return (
    <div className={stepperRootClass}>
      <Button
        variant="ghost"
        unstyled
        className={stepperButtonClass}
        aria-label={CART_COPY.decreaseQuantity}
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
      >
        <Icon icon={Minus} size={16} />
      </Button>

      <Text as="span" size="sm" weight="medium" className={stepperValueClass}>
        {String(quantity)}
      </Text>

      <Button
        variant="ghost"
        unstyled
        className={stepperButtonClass}
        aria-label={CART_COPY.increaseQuantity}
        onClick={() => onChange(quantity + 1)}
      >
        <Icon icon={Plus} size={16} />
      </Button>
    </div>
  );
}

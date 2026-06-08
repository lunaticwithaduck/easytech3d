'use client';

import { MinusIcon, PlusIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Text } from '@/design-system/primitives/Text/Text';
import { CART_COPY } from '../../config/constants';
import {
  minusIconClass,
  plusIconClass,
  stepperButtonClass,
  stepperRootClass,
  stepperValueClass,
} from './QuantityStepper.styles';

export type QuantityStepperProps = {
  quantity: number;
  /** Called with the requested new quantity; the parent clamps to a minimum of 1. */
  onChange: (quantity: number) => void;
};

// `.QuantitySelector` from `cart-items.liquid`: a minus link, the current-quantity input readout,
// and a plus link inside a 120px-wide pill (theme glyphs `icon 'minus'` / `icon 'plus'`). Stub-wired:
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
        <MinusIcon className={minusIconClass} />
      </Button>

      <Text as="span" className={stepperValueClass}>
        {String(quantity)}
      </Text>

      <Button
        variant="ghost"
        unstyled
        className={stepperButtonClass}
        aria-label={CART_COPY.increaseQuantity}
        onClick={() => onChange(quantity + 1)}
      >
        <PlusIcon className={plusIconClass} />
      </Button>
    </div>
  );
}

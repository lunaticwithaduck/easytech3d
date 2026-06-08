'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Text } from '@/design-system/primitives/Text/Text';
import { TextPrice } from '@/design-system/primitives/Text/TextPrice';
import type { Money } from '@/server/catalog/types';
import { CART_COPY } from '../../config/constants';
import {
  checkoutButtonClass,
  subtotalRowClass,
  summaryCardClass,
} from './OrderSummary.styles';

export type OrderSummaryProps = {
  subtotal: Money;
};

// Order-summary box: a title, the subtotal row, a tax/shipping note, and the primary checkout CTA.
// Checkout is a no-op this session (there is no checkout route yet).
export function OrderSummary({ subtotal }: OrderSummaryProps) {
  return (
    <div className={summaryCardClass}>
      <Text as="h2" size="lg" weight="semibold" value={CART_COPY.summaryTitle} />

      <div className={subtotalRowClass}>
        <Text as="span" size="base" color="muted" value={CART_COPY.subtotal} />
        <TextPrice
          amount={subtotal.amount}
          currency={subtotal.currencyCode}
          size="lg"
          weight="bold"
        />
      </div>

      <Text as="p" size="sm" color="muted" value={CART_COPY.shippingNote} />

      <Button variant="primary" size="lg" className={checkoutButtonClass} onClick={() => {}}>
        <Text as="span" size="base" weight="medium" color="current" value={CART_COPY.checkout} />
        <Icon icon={ArrowRight} size={18} />
      </Button>
    </div>
  );
}

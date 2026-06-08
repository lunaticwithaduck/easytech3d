import { routes } from '@/config/routes';
import { TailRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { TextPrice } from '@/design-system/primitives/Text/TextPrice';
import type { Money } from '@/server/catalog/types';
import { CART_COPY } from '../../config/constants';
import {
  buttonsContainerClass,
  checkoutButtonClass,
  checkoutIconClass,
  continueLinkClass,
  subtotalRowClass,
  summaryCardClass,
  summaryContentClass,
  summaryTitleClass,
  taxNoteClass,
} from './OrderSummary.styles';

export type OrderSummaryProps = {
  subtotal: Money;
};

// `.Cart_SidebarSide > .cart__block` from `cart-template.liquid`: the grey "Общо в количката" title
// bar, the "общо" subtotal row, a tax/shipping note, the primary "Плащане" checkout CTA, and a
// "Продължете пазаруването" link back to the store. Checkout is a no-op this session (there is no
// checkout route yet).
export function OrderSummary({ subtotal }: OrderSummaryProps) {
  return (
    <div className={summaryCardClass}>
      <Text
        as="h2"
        size="base"
        weight="bold"
        className={summaryTitleClass}
        value={CART_COPY.summaryTitle}
      />

      <div className={subtotalRowClass}>
        <Text as="span" size="base" color="muted" value={CART_COPY.subtotal} />
        <TextPrice
          amount={subtotal.amount}
          currency={subtotal.currencyCode}
          size="base"
          weight="bold"
        />
      </div>

      <div className={summaryContentClass}>
        <Text as="p" size="sm" color="muted" className={taxNoteClass} value={CART_COPY.shippingNote} />

        <div className={buttonsContainerClass}>
          <Button variant="primary" className={checkoutButtonClass}>
            <Text as="span" size="base" weight="bold" color="current" value={CART_COPY.checkout} />
            <TailRightIcon className={checkoutIconClass} />
          </Button>
        </div>

        <Link href={routes.home} variant="unstyled" className={continueLinkClass}>
          {CART_COPY.continueShopping}
        </Link>
      </div>
    </div>
  );
}

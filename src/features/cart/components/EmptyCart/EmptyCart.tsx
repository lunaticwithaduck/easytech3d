import { ArrowRight, ShoppingCart } from 'lucide-react';
import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { CART_COPY } from '../../config/constants';
import {
  emptyIconWrapClass,
  emptyMessageClass,
  emptyRootClass,
} from './EmptyCart.styles';

// Empty-cart state: a cart icon, the "Количката ви е празна" title + the live capture's message,
// and a CTA back to the catalog. Matches the centered layout of the live empty cart.
export function EmptyCart() {
  return (
    <div className={emptyRootClass}>
      <span className={emptyIconWrapClass}>
        <Icon icon={ShoppingCart} size={36} />
      </span>

      <Text as="h2" size="2xl" weight="bold" value={CART_COPY.emptyTitle} />
      <Text
        as="p"
        size="base"
        color="muted"
        className={emptyMessageClass}
        value={CART_COPY.emptyMessage}
      />

      <Button asChild variant="primary" size="lg">
        <Link href={routes.collections} variant="unstyled">
          <Text as="span" size="base" weight="medium" color="current" value={CART_COPY.backToShop} />
          <Icon icon={ArrowRight} size={18} />
        </Link>
      </Button>
    </div>
  );
}

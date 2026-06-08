import { routes } from '@/config/routes';
import { CartIcon, TailRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { CART_COPY } from '../../config/constants';
import {
  ctaIconClass,
  emptyIconClass,
  emptyIconWrapClass,
  emptyMessageClass,
  emptyRootClass,
} from './EmptyCart.styles';

// Empty-cart state (`.empty-page-content` in `cart-template.liquid`): the theme cart glyph, the
// "Количката ви е празна" title + the live capture's "Количката е празна. ;(" message, and a CTA
// back to the collections index. Reached when the last line item is removed.
export function EmptyCart() {
  return (
    <div className={emptyRootClass}>
      <span className={emptyIconWrapClass}>
        <CartIcon className={emptyIconClass} />
      </span>

      <Text as="h2" size="2xl" weight="bold" value={CART_COPY.emptyTitle} />
      <Text
        as="p"
        size="base"
        color="muted"
        className={emptyMessageClass}
        value={CART_COPY.emptyMessage}
      />

      <Button asChild variant="primary">
        <Link href={routes.collections} variant="unstyled">
          <Text as="span" size="base" weight="bold" color="current" value={CART_COPY.backToShop} />
          <TailRightIcon className={ctaIconClass} />
        </Link>
      </Button>
    </div>
  );
}

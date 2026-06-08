import { ShoppingCart, User } from 'lucide-react';
import { routes } from '@/config/routes';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import type { NavItem } from '@/server/catalog/types';
import { DesktopNav } from './components/DesktopNav/DesktopNav';
import { LocaleSwitch } from './components/LocaleSwitch/LocaleSwitch';
import { MobileMenu } from './components/MobileMenu/MobileMenu';
import { SearchBar } from './components/SearchBar/SearchBar';
import { HEADER_COPY } from './config/constants';
import {
  actionsClass,
  cartWrapperClass,
  headerRowClass,
  headerVariants,
  iconActionClass,
  wordmarkClass,
} from './Header.styles';

export type HeaderProps = {
  menu: NavItem[];
};

/**
 * Sticky storefront header. Server shell composing client subcomponents:
 * desktop hover mega-menu nav, search bar, cart/account links, BG/EN switch,
 * and a mobile hamburger → slide-in accordion drawer.
 */
export function Header({ menu }: HeaderProps) {
  return (
    <header className={headerVariants()}>
      <Container size="wide">
        <div className={headerRowClass}>
          <Link href={routes.home} variant="unstyled" className={wordmarkClass}>
            <Text as="span" color="primary" value={HEADER_COPY.brand} />
          </Link>

          <DesktopNav menu={menu} />

          <div className={actionsClass}>
            <SearchBar />

            <Link
              href={routes.cart}
              variant="unstyled"
              className={`${cartWrapperClass} ${iconActionClass}`}
              aria-label={HEADER_COPY.cartLabel}
            >
              <Icon icon={ShoppingCart} size={20} />
            </Link>

            <Link
              href={routes.account.home}
              variant="unstyled"
              className={iconActionClass}
              aria-label={HEADER_COPY.accountLabel}
            >
              <Icon icon={User} size={20} />
            </Link>

            <LocaleSwitch />

            <MobileMenu menu={menu} />
          </div>
        </div>
      </Container>
    </header>
  );
}

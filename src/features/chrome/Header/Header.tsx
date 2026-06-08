import { routes } from '@/config/routes';
import { AccountIcon, CartIcon } from '@/design-system/icons';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { DesktopNav } from './components/DesktopNav/DesktopNav';
import { LocaleSwitch } from './components/LocaleSwitch/LocaleSwitch';
import { MobileMenu } from './components/MobileMenu/MobileMenu';
import { SearchBar } from './components/SearchBar/SearchBar';
import { HEADER_COPY } from './config/constants';
import {
  accountIconGlyphClass,
  accountIconLinkClass,
  cartBadgeClass,
  cartIconClass,
  cartLinkClass,
  headerVariants,
  iconsWrapClass,
  logoLinkClass,
  logoWrapClass,
  mainRowClass,
  pageWidthClass,
  topAccountIconClass,
  topAccountLinkClass,
  topRowClass,
  topRowInnerClass,
} from './Header.styles';

export type HeaderProps = {
  menu: NavItem[];
  /** Live cart line-item count for the badge (0 = empty). */
  cartCount?: number;
};

/**
 * Solid-white storefront header (`.site-header.logo--inline`), sticky below the announcement bar.
 * Three rows faithful to `sections/header.liquid`:
 *   1. top utility row — right-aligned `Моят Акаунт` link
 *   2. main row — logo (styled wordmark) + horizontal UPPERCASE mega-menu nav + icons cluster
 *      (pink search pill, pink circular cart, account icon, BG/EN switch, mobile hamburger)
 * The pink search pill, pink cart circle and mega-menu hover panels match the live theme exactly.
 */
export function Header({ menu, cartCount = 0 }: HeaderProps) {
  return (
    <header className={headerVariants()}>
      {/* TOP UTILITY ROW — `.header_top` (My Account, right-aligned) */}
      <div className={topRowClass}>
        <div className={pageWidthClass}>
          <div className={topRowInnerClass}>
            <Link href={routes.account.home} variant="unstyled" className={topAccountLinkClass}>
              <AccountIcon className={topAccountIconClass} />
              <Text
                as="span"
                size="2xs"
                weight="semibold"
                color="current"
                value={HEADER_COPY.accountLabel}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN ROW — logo + nav + icons */}
      <div className={pageWidthClass}>
        <div className={mainRowClass}>
          <div className={logoWrapClass}>
            <Link href={routes.home} variant="unstyled" className={logoLinkClass}>
              <Text as="span" size="xl" weight="bold" color="text" value={HEADER_COPY.brand} />
            </Link>
          </div>

          <DesktopNav menu={menu} />

          <div className={iconsWrapClass}>
            <SearchBar />

            <Link
              href={routes.cart}
              variant="unstyled"
              className={cartLinkClass}
              aria-label={HEADER_COPY.cartLabel}
            >
              <CartIcon className={cartIconClass} />
              <span className={cartBadgeClass}>{cartCount}</span>
            </Link>

            <Link
              href={routes.account.home}
              variant="unstyled"
              className={accountIconLinkClass}
              aria-label={HEADER_COPY.accountLabel}
            >
              <AccountIcon className={accountIconGlyphClass} />
            </Link>

            <LocaleSwitch />

            <MobileMenu menu={menu} cartCount={cartCount} />
          </div>
        </div>
      </div>
    </header>
  );
}

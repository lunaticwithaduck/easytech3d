'use client';

import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { AccountIcon, CartIcon, CloseIcon, HamburgerIcon, SearchIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { HEADER_COPY } from '../../config/constants';
import { LocaleSwitch } from '../LocaleSwitch/LocaleSwitch';
import { MobileNavAccordion } from '../MobileNavAccordion/MobileNavAccordion';
import {
  drawerAccountClass,
  drawerAccountIconClass,
  drawerCartBadgeClass,
  drawerCircleClass,
  drawerCircleIconClass,
  drawerCircleSmallIconClass,
  drawerFooterClass,
  drawerHeaderClass,
  drawerHeaderIconsClass,
  drawerLogoClass,
  drawerNavClass,
  drawerVariants,
  hamburgerClass,
  hamburgerIconClass,
  overlayVariants,
} from './MobileMenu.styles';

type MobileMenuProps = {
  menu: NavItem[];
  cartCount?: number;
};

/**
 * Mobile hamburger → right-side off-canvas DRAWER (`#MobileNav`). Full-width, 100vh, slides in from
 * the right over a `rgba(46,45,43,.8)` overlay (theme behaviour). The drawer top bar mirrors the
 * live header (logo + pink search/cart/close circles); below it the nav renders as a multi-level
 * accordion, with the account link + BG/EN switch pinned to the footer. Closes on overlay/Escape.
 */
export function MobileMenu({ menu, cartCount = 0 }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    // Body scroll-lock while the drawer is open (theme MobileNav behaviour).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="primary"
        unstyled
        className={hamburgerClass}
        aria-label={HEADER_COPY.openMenuLabel}
        aria-expanded={open}
        aria-controls="MobileNav"
        onClick={() => setOpen(true)}
      >
        <HamburgerIcon className={hamburgerIconClass} />
      </Button>

      <div className={overlayVariants({ open })} aria-hidden onClick={() => setOpen(false)} />

      <aside
        id="MobileNav"
        className={drawerVariants({ open })}
        aria-label={HEADER_COPY.openMenuLabel}
        aria-hidden={!open}
      >
        {/* Drawer top bar — white, mirrors the header (logo + pink circles) */}
        <div className={drawerHeaderClass}>
          <Link
            href={routes.home}
            variant="unstyled"
            className={drawerLogoClass}
            onClick={() => setOpen(false)}
          >
            <Text as="span" size="xl" weight="bold" color="text" value={HEADER_COPY.brand} />
          </Link>

          <div className={drawerHeaderIconsClass}>
            <Link
              href={routes.search}
              variant="unstyled"
              className={drawerCircleClass}
              aria-label={HEADER_COPY.searchLabel}
              onClick={() => setOpen(false)}
            >
              <SearchIcon className={drawerCircleSmallIconClass} />
            </Link>
            <Link
              href={routes.cart}
              variant="unstyled"
              className={drawerCircleClass}
              aria-label={HEADER_COPY.cartLabel}
              onClick={() => setOpen(false)}
            >
              <CartIcon className={drawerCircleIconClass} />
              <span className={drawerCartBadgeClass}>{cartCount}</span>
            </Link>
            <Button
              type="button"
              variant="primary"
              unstyled
              className={drawerCircleClass}
              aria-label={HEADER_COPY.closeMenuLabel}
              onClick={() => setOpen(false)}
            >
              <CloseIcon className={drawerCircleSmallIconClass} />
            </Button>
          </div>
        </div>

        {/* Multi-level accordion nav */}
        <nav className={drawerNavClass} aria-label="Mobile primary">
          <ul>
            {menu.map((item) => (
              <li key={item.href}>
                <MobileNavAccordion item={item} onNavigate={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer — account pill + locale switch (theme `.mobile-nav-footer`) */}
        <div className={drawerFooterClass}>
          <Link
            href={routes.account.home}
            variant="unstyled"
            className={drawerAccountClass}
            onClick={() => setOpen(false)}
          >
            <AccountIcon className={drawerAccountIconClass} />
            <Text as="span" size="sm" color="current" value={HEADER_COPY.accountLabel} />
          </Link>
          <LocaleSwitch alwaysVisible />
        </div>
      </aside>
    </>
  );
}

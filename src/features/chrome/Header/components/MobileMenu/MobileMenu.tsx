'use client';

import { Menu, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { HEADER_COPY } from '../../config/constants';
import { MobileNavAccordion } from '../MobileNavAccordion/MobileNavAccordion';
import {
  drawerAccountClass,
  drawerCloseClass,
  drawerFooterClass,
  drawerHeaderClass,
  drawerNavClass,
  drawerVariants,
  hamburgerClass,
  overlayVariants,
} from './MobileMenu.styles';

type MobileMenuProps = {
  menu: NavItem[];
};

// Mobile hamburger → slide-in drawer with an accordion nav. Closes on overlay click / Escape.
export function MobileMenu({ menu }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        unstyled
        className={hamburgerClass}
        aria-label={HEADER_COPY.openMenuLabel}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon icon={Menu} size={22} />
      </Button>

      <div className={overlayVariants({ open })} aria-hidden onClick={() => setOpen(false)} />

      <aside
        className={drawerVariants({ open })}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className={drawerHeaderClass}>
          <Text as="span" size="lg" weight="bold" color="inverse" value={HEADER_COPY.brand} />
          <Button
            type="button"
            variant="ghost"
            unstyled
            className={drawerCloseClass}
            aria-label={HEADER_COPY.closeMenuLabel}
            onClick={() => setOpen(false)}
          >
            <Icon icon={X} size={20} />
          </Button>
        </div>

        <nav className={drawerNavClass} aria-label="Mobile primary">
          <ul>
            {menu.map((item) => (
              <li key={item.href}>
                <MobileNavAccordion item={item} onNavigate={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        </nav>

        <div className={drawerFooterClass}>
          <Link
            href={routes.account.home}
            variant="unstyled"
            className={drawerAccountClass}
            onClick={() => setOpen(false)}
          >
            <Icon icon={User} size={18} />
            <Text
              as="span"
              size="base"
              weight="medium"
              color="current"
              value={HEADER_COPY.accountLabel}
            />
          </Link>
        </div>
      </aside>
    </>
  );
}

'use client';

import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { megaItemClass, megaLinkClass, megaListClass, megaPanelClass } from './MegaMenu.styles';

type MegaMenuProps = {
  items: NavItem[];
};

/**
 * Hover/focus MEGA-MENU panel (`.mega-menu` / dropdown-style `.second_lvl.nav-dropdown`).
 * White panel (min-width 760px, radius 20px, padding 16px) listing the parent item's children as
 * a multi-column grid of pill links (padding 9px 30px, 14px, radius 50px, hover bg #ff1b5c).
 */
export function MegaMenu({ items }: MegaMenuProps) {
  return (
    <div className={megaPanelClass}>
      <ul className={megaListClass}>
        {items.map((child) => (
          <li key={child.href} className={megaItemClass}>
            <Link href={child.href} variant="unstyled" className={megaLinkClass}>
              <Text as="span" size="sm" color="current">
                {child.label}
              </Text>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';

import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { megaGridClass, megaLinkClass, megaPanelClass } from './MegaMenu.styles';

type MegaMenuProps = {
  items: NavItem[];
};

// Hover/focus dropdown panel listing a nav item's children as links.
export function MegaMenu({ items }: MegaMenuProps) {
  return (
    <div className={megaPanelClass}>
      <ul className={megaGridClass}>
        {items.map((child) => (
          <li key={child.href}>
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

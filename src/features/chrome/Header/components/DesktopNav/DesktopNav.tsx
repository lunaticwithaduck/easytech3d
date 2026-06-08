'use client';

import { ChevronDown } from 'lucide-react';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { desktopNavWrapperClass } from '../../Header.styles';
import { MegaMenu } from '../MegaMenu/MegaMenu';
import { navCaretClass, navItemClass, navLinkClass, navListClass } from './DesktopNav.styles';

type DesktopNavProps = {
  menu: NavItem[];
};

// Horizontal desktop nav. Items with `children` reveal a hover/focus mega-menu panel.
export function DesktopNav({ menu }: DesktopNavProps) {
  return (
    <nav className={desktopNavWrapperClass} aria-label="Primary">
      <ul className={navListClass}>
        {menu.map((item) => {
          const hasChildren = (item.children?.length ?? 0) > 0;
          return (
            <li key={item.href} className={navItemClass}>
              <Link href={item.href} variant="unstyled" className={navLinkClass}>
                <Text as="span" size="sm" weight="medium" color="current">
                  {item.label}
                </Text>
                {hasChildren ? (
                  <span className={navCaretClass}>
                    <Icon icon={ChevronDown} size={16} />
                  </span>
                ) : null}
              </Link>

              {hasChildren ? <MegaMenu items={item.children ?? []} /> : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

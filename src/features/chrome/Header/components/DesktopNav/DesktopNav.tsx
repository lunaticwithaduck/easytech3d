'use client';

import { ArrowBottomIcon } from '@/design-system/icons';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { MegaMenu } from '../MegaMenu/MegaMenu';
import {
  navCaretClass,
  navItemClass,
  navLinkClass,
  navListClass,
  navWrapperClass,
} from './DesktopNav.styles';

type DesktopNavProps = {
  menu: NavItem[];
};

/**
 * Horizontal desktop nav (`.main_nav-bar_linklist`). UPPERCASE, Archivo Narrow (font-nav).
 * Items with children carry the theme `arrow-bottom` caret and reveal a hover/focus MEGA-MENU
 * panel (CSS group-hover, matching the theme's `.visible`-on-hover behaviour). Hidden < 750px.
 */
export function DesktopNav({ menu }: DesktopNavProps) {
  return (
    <nav className={navWrapperClass} aria-label="Primary">
      <ul className={navListClass}>
        {menu.map((item) => {
          const children = item.children ?? [];
          const hasChildren = children.length > 0;
          return (
            <li key={item.href} className={navItemClass}>
              <Link
                href={item.href}
                variant="unstyled"
                className={navLinkClass}
                aria-haspopup={hasChildren || undefined}
              >
                <Text as="span" size="base" weight="normal" color="current">
                  {item.label}
                </Text>
                {hasChildren ? <ArrowBottomIcon className={navCaretClass} /> : null}
              </Link>

              {hasChildren ? <MegaMenu items={children} /> : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

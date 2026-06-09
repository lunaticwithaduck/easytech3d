'use client';

import { useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/snippets/Icon';
import { cn } from '@/lib/cn';
import type { MenuLink } from '@/lib/shopify/types';

// Translation of the mobile concern of sections/header.liquid: the `js-mobile-nav-toggle` button
// (rendered in the icons-wrapper) AND the `.mobile-nav-wrapper` drawer. Both live in one client
// component so they can share the open/level state the live theme.js manages by class-toggling.
//
// The theme slides between menu levels by adding `sub-nav--is-open` / `third-nav--is-open` /
// `fourth-nav--is-open` to the wrapper (translating `.mobile-nav` by -100% per level). The drawer
// itself opens via `js-menu--is-open` on the wrapper + on <body> (for the overlay). We reproduce
// the exact markup/classes of icon-hamburger / icon-close and the multi-level dropdown lists.

const LEVEL_OPEN_CLASS = ['', 'sub-nav--is-open', 'third-nav--is-open', 'fourth-nav--is-open'];

export function MobileMenu({ menu }: { menu: MenuLink[] }) {
  const [open, setOpen] = useState(false);
  // breadcrumb of opened submenu `data-target` ids (length === active depth)
  const [trail, setTrail] = useState<string[]>([]);

  const setBody = useCallback((isOpen: boolean) => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('js-menu--is-open', isOpen);
    }
  }, []);

  const toggleDrawer = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      setBody(next);
      if (!next) setTrail([]);
      return next;
    });
  }, [setBody]);

  const openSubmenu = useCallback((target: string) => {
    setTrail((prev) => [...prev, target]);
  }, []);

  const returnTo = useCallback((target: string) => {
    // return button carries the PARENT target; trim the trail back to it (or to root)
    setTrail((prev) => {
      const idx = prev.indexOf(target);
      return idx === -1 ? [] : prev.slice(0, idx + 1);
    });
  }, []);

  const depth = trail.length;
  const isOpenTarget = (target: string) => trail.includes(target);

  return (
    <>
      <button
        type="button"
        className={cn(
          'btn--link site-header__icon site-header__menu js-mobile-nav-toggle',
          open ? 'mobile-nav--close' : 'mobile-nav--open',
        )}
        aria-controls="MobileNav"
        aria-expanded={open}
        aria-label="Навигация"
        onClick={toggleDrawer}
      >
        <Icon name="hamburger-large" />
        <Icon name="close-large" />
      </button>

      <nav
        className={cn(
          'mobile-nav-wrapper medium-up--hide',
          open ? 'js-menu--is-open' : 'critical-hidden',
          LEVEL_OPEN_CLASS[Math.min(depth, 3)],
        )}
        role="navigation"
      >
        <ul id="MobileNav" className="mobile-nav">
          {menu.map((link, i) => (
            <MobileNavItem
              key={link.url + link.title}
              link={link}
              index={i + 1}
              parentTarget=""
              isOpenTarget={isOpenTarget}
              openSubmenu={openSubmenu}
              returnTo={returnTo}
            />
          ))}
        </ul>

        <div className="mobile-nav-footer" />
      </nav>
    </>
  );
}

type ItemProps = {
  link: MenuLink;
  index: number;
  parentTarget: string;
  isOpenTarget: (target: string) => boolean;
  openSubmenu: (target: string) => void;
  returnTo: (target: string) => void;
};

// One mobile-nav list item. Mirrors the liquid: a leaf renders a <Link>, a branch renders a
// `js-toggle-submenu` button + a nested `.mobile-nav__dropdown` with a return button header.
function MobileNavItem({
  link,
  index,
  parentTarget,
  isOpenTarget,
  openSubmenu,
  returnTo,
}: ItemProps) {
  const hasChildren = !!link.links && link.links.length > 0;

  if (!hasChildren) {
    return (
      <li className="mobile-nav__item">
        <Link
          href={link.url}
          className={cn(
            parentTarget ? 'mobile-nav__sublist-link' : 'mobile-nav__link',
          )}
        >
          <span className="mobile-nav__label">{link.title}</span>
        </Link>
      </li>
    );
  }

  // stable target handle, modelled on the liquid `{{ handle }}-{{ index }}` captures
  const target = `${slug(link.title)}-${index}`;
  const opened = isOpenTarget(target);

  return (
    <li className="mobile-nav__item">
      <button
        type="button"
        className={cn(
          'btn--link js-toggle-submenu mobile-nav__link',
          parentTarget && 'mobile-nav__sublist-link',
        )}
        data-target={target}
        {...(parentTarget ? {} : { 'data-level': 1 })}
        aria-expanded={opened}
        onClick={() => openSubmenu(target)}
      >
        <span className="mobile-nav__label">{link.title}</span>
        <div className="mobile-nav__icon">
          <Icon name="chevron-right" />
        </div>
      </button>

      <ul
        className="mobile-nav__dropdown"
        data-parent={target}
        style={opened ? { right: 0 } : undefined}
      >
        <li className="visually-hidden" tabIndex={-1}>
          {link.title} Навигация
        </li>
        <li className="mobile-nav__item">
          <div className="mobile-nav__table">
            <div className="mobile-nav__table-cell mobile-nav__return">
              <button
                type="button"
                className="btn--link js-toggle-submenu mobile-nav__return-btn"
                {...(parentTarget ? { 'data-target': parentTarget } : {})}
                aria-expanded
                aria-label={link.title}
                onClick={() => returnTo(parentTarget)}
              >
                <Icon name="chevron-left" />
                <span className="mobile-nav__label">{link.title}</span>
              </button>
            </div>
          </div>
        </li>

        {link.links?.map((child, ci) => (
          <MobileNavItem
            key={child.url + child.title}
            link={child}
            index={ci + 1}
            parentTarget={target}
            isOpenTarget={isOpenTarget}
            openSubmenu={openSubmenu}
            returnTo={returnTo}
          />
        ))}
      </ul>
    </li>
  );
}

// ascii-safe-ish slug for the data-target ids (Cyrillic is kept; only spaces collapsed)
function slug(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, '-');
}

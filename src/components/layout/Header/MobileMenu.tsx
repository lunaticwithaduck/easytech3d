'use client';

import { useCallback, useState } from 'react';
import { Button, cn, Icon, Link } from '@/design-system';
import type { MenuLink } from '@/lib/shopify/types';

// Mobile nav — design-system version (primitives + @theme utilities only). Faithful to the live
// render (probed iPhone 12): a 45px pink circle toggle that swaps the hamburger for an X when open,
// and a dark (#232323 = ink) full-width drawer that slides down below the header. The drawer is a
// multi-level menu: tapping a branch ("Филаменти") slides in its submenu with a return header.
//
// Keeps the original client state: `open` (drawer) + `trail` (breadcrumb of opened submenu targets,
// length === active depth). The whole tree slides left by one panel-width per opened level.

export function MobileMenu({ menu }: { menu: MenuLink[] }) {
  const [open, setOpen] = useState(false);
  const [trail, setTrail] = useState<string[]>([]);

  const toggleDrawer = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (!next) setTrail([]);
      return next;
    });
  }, []);

  const openSubmenu = useCallback((target: string) => {
    setTrail((prev) => [...prev, target]);
  }, []);

  // return button carries the PARENT target; trim the trail back to it (or to root)
  const returnTo = useCallback((target: string) => {
    setTrail((prev) => {
      const idx = prev.indexOf(target);
      return idx === -1 ? [] : prev.slice(0, idx + 1);
    });
  }, []);

  const isOpenTarget = (target: string) => trail.includes(target);

  return (
    <>
      <Button
        variant="primary"
        size="circle"
        aria-controls="MobileNav"
        aria-expanded={open}
        aria-label="Навигация"
        onClick={toggleDrawer}
        className="size-[45px] shrink-0 border-0"
      >
        <Icon name={open ? 'close-large' : 'hamburger-large'} className="size-[18px]" />
      </Button>

      {/* drawer — slides down below the header bar; overflow-hidden clips the slide-in submenus */}
      <nav
        id="MobileNav"
        aria-label="Мобилна навигация"
        className={cn(
          'absolute inset-x-0 top-full z-40 overflow-hidden bg-ink text-white shadow-xl transition-[max-height] duration-300',
          open ? 'max-h-[80vh]' : 'pointer-events-none max-h-0',
        )}
      >
        {/* relative wrapper: submenu panels overlay this box (absolute inset-0), not the header */}
        <div className="relative max-h-[80vh] overflow-y-auto">
          <ul className="py-2">
            {menu.map((link, i) => (
              <MobileNavItem
                key={link.url + link.title}
                link={link}
                index={i + 1}
                parentTarget=""
                isOpenTarget={isOpenTarget}
                openSubmenu={openSubmenu}
                returnTo={returnTo}
                closeDrawer={toggleDrawer}
              />
            ))}
          </ul>
        </div>
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
  closeDrawer: () => void;
};

// One drawer row. A leaf is a white Link; a branch is a button (label + pink chevron-right) plus a
// nested panel that slides in from the right when its target is in the trail.
function MobileNavItem({
  link,
  index,
  parentTarget,
  isOpenTarget,
  openSubmenu,
  returnTo,
  closeDrawer,
}: ItemProps) {
  const hasChildren = !!link.links && link.links.length > 0;
  const rowClass =
    'flex w-full items-center justify-between border-b border-white/10 px-5 py-4 text-left text-base text-white';

  if (!hasChildren) {
    return (
      <li>
        <Link href={link.url} onClick={closeDrawer} className={cn(rowClass, 'hover:text-primary')}>
          <span>{link.title}</span>
        </Link>
      </li>
    );
  }

  // stable target handle, modelled on the liquid `{{ handle }}-{{ index }}` captures
  const target = `${slug(link.title)}-${index}`;
  const opened = isOpenTarget(target);

  return (
    <li>
      <button
        type="button"
        aria-expanded={opened}
        onClick={() => openSubmenu(target)}
        className={cn(rowClass, 'hover:text-primary')}
      >
        <span>{link.title}</span>
        <Icon name="chevron-right" className="size-3.5 text-primary" />
      </button>

      {/* submenu panel — absolutely overlays the drawer, slid in from the right when opened */}
      <ul
        className={cn(
          'absolute inset-0 z-10 overflow-y-auto bg-ink py-2 transition-transform duration-300 ease-out',
          opened ? 'translate-x-0' : 'pointer-events-none translate-x-full',
        )}
      >
        <li>
          <button
            type="button"
            aria-label={link.title}
            onClick={() => returnTo(parentTarget)}
            className="flex w-full items-center gap-2 border-b border-white/10 px-5 py-4 text-left text-base font-bold text-white hover:text-primary"
          >
            <Icon name="chevron-left" className="size-3.5 text-primary" />
            <span>{link.title}</span>
          </button>
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
            closeDrawer={closeDrawer}
          />
        ))}
      </ul>
    </li>
  );
}

// ascii-safe-ish slug for the target ids (Cyrillic is kept; only spaces collapsed)
function slug(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, '-');
}

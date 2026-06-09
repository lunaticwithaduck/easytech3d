import { cn, Icon, Link, Text } from '@/design-system';
import type { MenuLink } from '@/lib/shopify/types';

// Desktop primary nav — design-system version (primitives + @theme utilities only). Faithful to the
// live render (probed): horizontal list of UPPERCASE font-nav links (Archivo Narrow, 16px/400, ink),
// 35px gutter between items. A parent link (only "Филаменти") reveals a white dropdown card on hover
// — pure CSS (group-hover), so this stays a Server Component exactly like the live mirror.

// A single link inside a nav dropdown. With its own children it nests a side-opening submenu (the
// "PLA" branch); otherwise it is a plain row. Dropdown rows are dark ink on white (the live
// `nav-dropdown__link` is black, per the header's scoped custom CSS).
function DropdownItem({ link }: { link: MenuLink }) {
  const hasChildren = !!link.links && link.links.length > 0;

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={link.url}
          className="block whitespace-nowrap px-[10px] py-[5px] text-[15px] uppercase leading-[1.5] text-black hover:text-primary"
        >
          <span>{link.title}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className="group/sub relative">
      <Link
        href={link.url}
        className="flex items-center justify-between gap-3 whitespace-nowrap px-[10px] py-[5px] text-[15px] uppercase leading-[1.5] text-black hover:text-primary"
        aria-haspopup="true"
      >
        <span>{link.title}</span>
        <Icon name="chevron-right" className="size-3 text-current" />
      </Link>

      <ul
        className={cn(
          'invisible absolute left-full top-0 z-30 min-w-[180px] -translate-x-1 rounded-media bg-surface px-[10px] py-4 opacity-0 shadow-lg',
          'transition-all duration-150 group-hover/sub:visible group-hover/sub:translate-x-0 group-hover/sub:opacity-100',
        )}
      >
        {link.links?.map((sub) => (
          <li key={sub.url + sub.title}>
            <Link
              href={sub.url}
              className="block whitespace-nowrap px-[10px] py-[5px] text-[15px] uppercase leading-[1.5] text-black hover:text-primary"
            >
              <span>{sub.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function DesktopNav({ menu }: { menu: MenuLink[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-[35px] gap-y-2">
      {menu.map((link) => {
        const hasChildren = !!link.links && link.links.length > 0;

        if (!hasChildren) {
          return (
            <li key={link.url + link.title}>
              <Link
                href={link.url}
                className="block whitespace-nowrap text-base uppercase tracking-normal text-ink hover:text-primary"
              >
                <Text as="span" nav value={link.title} />
              </Link>
            </li>
          );
        }

        return (
          <li key={link.url + link.title} className="group relative">
            <Link
              href={link.url}
              className="flex items-center gap-1 whitespace-nowrap text-base uppercase text-ink hover:text-primary"
              aria-haspopup="true"
            >
              <Text as="span" nav value={link.title} />
              <Icon name="arrow-bottom" className="h-2 w-3 text-ink" />
            </Link>

            <ul
              className={cn(
                'invisible absolute left-0 top-full z-30 min-w-[200px] rounded-media bg-surface px-[10px] py-4 opacity-0 shadow-lg',
                'transition-opacity duration-150 group-hover:visible group-hover:opacity-100',
              )}
            >
              {link.links?.map((child) => (
                <DropdownItem key={child.url + child.title} link={child} />
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

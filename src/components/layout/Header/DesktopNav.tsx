import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/snippets/Icon';
import { cn } from '@/lib/cn';
import type { MenuLink } from '@/lib/shopify/types';

// Translation of the `main_nav-bar_linklist` loop in sections/header.liquid plus the
// snippets/desktop-menu.liquid dropdowns (non-floating, non-mega-menu branch — matching the live
// site). Dropdowns reveal on hover via the theme CSS (.item-has-mega-menu:hover > .nav-dropdown),
// so this is a Server Component: no JS needed, exactly like the rendered mirror.
//
// `nav-triangle` lives in icon.liquid but not in the shared Icon map, so its SVG is inlined here
// verbatim (the live render resolves its fills to empty, hence fill="").

function NavTriangle() {
  return (
    <svg className="icon icon--nav-triangle" viewBox="0 0 20 9" role="presentation">
      <g fill="none" fillRule="evenodd">
        <path
          d="M.47108938 9c.2694725-.26871321.57077721-.56867841.90388257-.89986354C3.12384116 6.36134886 5.74788116 3.76338565 9.2467995.30653888c.4145057-.4095171 1.0844277-.40860098 1.4977971.00205122L19.4935156 9H.47108938z"
          fill=""
        />
        <path
          d="M-.00922471 9C1.38887087 7.61849126 4.26661926 4.80337304 8.62402045.5546454c.75993175-.7409708 1.98812015-.7393145 2.74596565.0037073L19.9800494 9h-1.3748787l-7.9226239-7.7676545c-.3789219-.3715101-.9930172-.3723389-1.3729808-.0018557-3.20734177 3.1273507-5.6127118 5.4776841-7.21584193 7.05073579C1.82769633 8.54226204 1.58379521 8.7818599 1.36203986 9H-.00922471z"
          fill=""
        />
      </g>
    </svg>
  );
}

// A single link inside a nav dropdown (snippets/desktop-menu.liquid). When the link has its own
// children, it gets a chevron and a nested .nav-dropdown that opens to the side on hover.
function DropdownItem({ link }: { link: MenuLink }) {
  const hasChildren = !!link.links && link.links.length > 0;

  return (
    <li className={cn('nav-dropdown__item', hasChildren && 'has-mega-menu', '')}>
      {!hasChildren ? (
        <Link href={link.url} className="nav-dropdown__link link" data-type="menuitem">
          <span>{link.title}</span>
        </Link>
      ) : (
        <>
          <Link
            href={link.url}
            className="nav-dropdown__link link"
            data-type="menuitem"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <span>{link.title}</span>
            <Icon name="chevron-right" />
          </Link>

          <ul className="nav-dropdown" data-type="menu" aria-hidden="true">
            {link.links?.map((sub) => (
              <li key={sub.url + sub.title} className="nav-dropdown__item">
                <Link href={sub.url} className="nav-dropdown__link link" data-type="menuitem">
                  <span>{sub.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </li>
  );
}

export function DesktopNav({ menu }: { menu: MenuLink[] }) {
  return (
    <ul className="nav-bar__linklist list--unstyled main_nav-bar_linklist" data-type="menu">
      {menu.map((link, i) => {
        const hasChildren = !!link.links && link.links.length > 0;

        return (
          <li
            key={link.url + link.title}
            className={cn('nav-bar__item', hasChildren && 'item-has-mega-menu', ' ')}
          >
            {!hasChildren ? (
              <Link href={link.url} className="nav-bar__link link" data-type="menuitem">
                {' '}
                <span>{link.title}</span>
              </Link>
            ) : (
              <>
                <Link
                  href={link.url}
                  className="nav-bar__link link"
                  data-type="menuitem"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span>{link.title}</span>
                  <Icon name="arrow-bottom" />
                  <NavTriangle />
                </Link>

                <ul
                  id={`dropdown-desktop-menu-0-${i + 1}`}
                  className="nav-dropdown"
                  data-type="menu"
                  aria-hidden="true"
                >
                  {link.links?.map((child) => (
                    <DropdownItem key={child.url + child.title} link={child} />
                  ))}
                </ul>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

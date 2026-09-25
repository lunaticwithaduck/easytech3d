import { mainMenu } from '@/data/menus';
import { shop } from '@/data/settings';
import { Container, Image, Link } from '@/design-system';
import { CartButton } from '../CartButton';
import { AccountLink } from './AccountLink';
import { DesktopNav } from './DesktopNav';
import { HeaderSearch } from './HeaderSearch';
import { MobileMenu } from './MobileMenu';

// Storefront header — design-system version (primitives + @theme utilities only; no theme classes).
// Faithful to the live render (probed at https://easytech3d.com/, desktop 1440 + iPhone 12):
//   • white surface, logo a 100px rounded-20 image (Image), uppercase font-nav links
//   • desktop (≥md): top "account" row, then logo + nav, then the pink "Всички Категории" pill +
//     55px-tall white search field + search icon + 53px pink cart circle
//   • mobile (<md): logo left, three 45px pink circle buttons (search / cart / hamburger) on the
//     right, and a slide-down dark drawer (MobileMenu owns the open/close state)
export function Header() {
  return (
    <header className="relative bg-surface">
      {/* top account row — desktop only (the live `header_top` is display:none on mobile). The
          account state is fetched CLIENT-side (AccountLink) so this server component reads no
          cookies and the whole page stays statically rendered (preserves catalog ISR). */}
      <Container className="hidden py-[5px] md:block">
        <div className="flex justify-end">
          <AccountLink />
        </div>
      </Container>

      {/* logo + desktop nav + (mobile) icon row. Desktop md:py-[18px] adds the vertical breathing
          room the live header has (≈240px total; the 100px logo sits centered with padding). */}
      <Container className="flex items-center justify-between gap-4 py-3 md:py-[18px]">
        <Link href="/" aria-label={shop.name} className="block shrink-0">
          <Image
            src={shop.logo}
            alt={shop.name}
            width={100}
            height={100}
            className="size-[100px] rounded-card object-cover"
          />
        </Link>

        {/* desktop nav (hidden on mobile) */}
        <nav className="hidden flex-1 md:block" aria-label="Основна навигация">
          <DesktopNav menu={mainMenu} />
        </nav>

        {/* mobile icon cluster (hidden on desktop) — HeaderSearch + cart own the search circle &
            cart; MobileMenu owns the hamburger + drawer. */}
        <div className="flex items-center gap-[10px] md:hidden">
          <HeaderSearch variant="mobile" />
          <CartButton variant="mobile" />
          <MobileMenu menu={mainMenu} />
        </div>
      </Container>

      {/* desktop search row: pink categories pill + search field + cart circle */}
      <Container className="hidden items-center gap-[10px] pt-2 pb-[18px] md:flex">
        <HeaderSearch variant="desktop" />
        <CartButton variant="desktop" />
      </Container>
    </header>
  );
}

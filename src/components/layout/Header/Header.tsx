import { mainMenu } from '@/data/menus';
import { shop } from '@/data/settings';
import { Button, Container, cn, Icon, Image, Link, Text } from '@/design-system';
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
    <header className="relative bg-surface" role="banner">
      {/* top account row — desktop only (the live `header_top` is display:none on mobile). The
          localization/account slot lives here; accounts are deferred, so this is a static link. */}
      <Container className="hidden py-[5px] md:block">
        <div className="flex justify-end">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-xs text-ink hover:text-primary"
          >
            <Icon name="account" className="size-4" />
            <Text as="span" size="xs" value="Моят Акаунт" />
          </Link>
        </div>
      </Container>

      {/* logo + desktop nav + (mobile) icon row */}
      <Container className="flex items-center justify-between gap-4 py-3 md:py-0">
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
          <CartCircle variant="mobile" />
          <MobileMenu menu={mainMenu} />
        </div>
      </Container>

      {/* desktop search row: pink categories pill + search field + cart circle */}
      <Container className="hidden items-center gap-[10px] pb-4 pt-1 md:flex">
        <HeaderSearch variant="desktop" />
        <CartCircle variant="desktop" />
      </Container>
    </header>
  );
}

// The pink cart circle with its count bubble (Button size="circle" variant="primary" rendered onto a
// Link via asChild). Desktop is 53px, mobile 45px (probed live). The bubble sits top-right with the
// count; the live store updates it via JS (static "0" until cart is wired).
function CartCircle({ variant }: { variant: 'desktop' | 'mobile' }) {
  const size = variant === 'desktop' ? 'size-[53px]' : 'size-[45px]';
  return (
    <Button asChild variant="primary" size="circle" className={cn('relative shrink-0', size)}>
      <Link href="/cart" aria-label="Количка">
        <Icon name="cart" className="size-5" />
        <span className="absolute -right-1 -top-1 inline-flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-surface ring-2 ring-surface">
          0
        </span>
      </Link>
    </Button>
  );
}

// EXACT theme mega-menu reproduction. The dropdown-style mega panel = `.second_lvl.nav-dropdown`:
//   { display:flex; flex-wrap:wrap; min-width:760px; padding:16px; border-radius:20px }
// surface = `--header_megamenu_bg` (#ffffff), hairline border `--color-border` (#ebebeb).
// Links = `.small_dropdown ... li a` { padding:9px 30px; font-size:14px; border-radius:50px }
// hover → background #ff1b5c (brand pink) with inverse text. Arbitrary px live here (R4 exempt).

// Panel anchored below the trigger (`top:full`); hidden until the parent group is hovered/focused
// (theme adds `.visible` on hover-intent → opacity/visibility transition). 760px min, radius 20.
export const megaPanelClass =
  'invisible absolute left-0 top-full z-30 mt-[5px] min-w-[760px] translate-y-1 rounded-[20px] border border-border bg-surface p-[16px] opacity-0 shadow-[0_10px_30px_rgba(35,35,35,0.12)] transition-all duration-200 group-hover/navitem:visible group-hover/navitem:translate-y-0 group-hover/navitem:opacity-100 group-focus-within/navitem:visible group-focus-within/navitem:translate-y-0 group-focus-within/navitem:opacity-100';

// `.second_lvl.nav-dropdown>ul` — flex-wrap row of columns; each item ~25% wide (4-up).
export const megaListClass = 'flex flex-wrap';
export const megaItemClass = 'w-1/2 min-[990px]:w-1/4';

// `.nav-dropdown ... a` — pill link, padding 9px 30px, 14px, radius 50px; hover bg #ff1b5c / #fff.
export const megaLinkClass =
  'block rounded-[50px] px-[30px] py-[9px] text-[14px] text-text transition-all duration-300 hover:bg-primary hover:text-inverse';

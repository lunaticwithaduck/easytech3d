// EXACT theme nav reproduction — `.main_nav-bar_linklist > .nav-bar__item > a.nav-bar__link`.
// Hidden below 750px (drawer takes over: `.site-header__mobile-nav nav{ small--hide }`).
// Arbitrary px live here (R4 exempts *.styles.ts).

// `<ul class="nav-bar__linklist main_nav-bar_linklist">` — flex row, centered against the icons.
export const navWrapperClass = 'hidden flex-1 min-[750px]:block';
export const navListClass = 'flex flex-wrap items-center';

// `.nav-bar__item{position:relative; display:inline-block; margin-right:35px; padding:5px 0}`.
// Each item is the hover/focus group anchoring its mega-menu panel.
export const navItemClass = 'group/navitem relative mr-[35px] py-[5px] last:mr-0';

// `.nav-bar__link{font-family:var(--font-stack-navigation)(=Archivo Narrow); font-weight:400;
// font-size:16px(navigation); display:block; cursor:pointer; color:#232323}`. Uppercase via
// header custom_css (`main_linklist_style=uppercase`). Hover → `--header_nav_hover_link` #ff1b5c.
export const navLinkClass =
  'flex items-center font-nav text-[15px] font-normal uppercase leading-none text-text transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none';

// `arrow-bottom` caret after items with children. Theme svg color = #ff1b5c
// (`.nav-bar__link svg{color:var(--color-btn-primary)}`). 9px box, 8px left of label.
export const navCaretClass =
  'ml-[8px] block size-[9px] text-primary transition-transform duration-200 group-hover/navitem:rotate-180 group-focus-within/navitem:rotate-180';

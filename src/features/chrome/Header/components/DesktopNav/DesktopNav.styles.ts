export const navListClass = 'flex items-center justify-center gap-1';

// Each top-level item is a hover/focus group anchoring its mega-menu panel.
export const navItemClass = 'group/navitem relative';

// Top-level link: uppercase, medium weight, primary on hover (matches the live nav).
export const navLinkClass =
  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium uppercase tracking-wide text-text transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary';

// Caret rotates when the group is hovered/focused.
export const navCaretClass =
  'transition-transform duration-200 group-hover/navitem:rotate-180 group-focus-within/navitem:rotate-180';

import { cva } from 'class-variance-authority';

// EXACT theme mobile-nav item reproduction (`#MobileNav .mobile-nav__item`):
//   rows have generous padding (~15px), white text on the dark drawer; submenu panel bg #1d1d1d.
//   `chevron-right` drill-in caret is pink (#ff1b5c). Arbitrary px live here (R4 exempts *.styles.ts).

// Row shared by the accordion toggle and the leaf link (`.mobile-nav__link`, padding 15px).
export const rowClass =
  'flex w-full items-center justify-between gap-2 px-5 py-[15px] text-left text-inverse transition-colors hover:bg-[rgba(255,255,255,0.05)] focus-visible:bg-[rgba(255,255,255,0.05)] focus-visible:outline-none';

// `chevron-right` drill-in caret — pink, rotates 90° when the group is open.
export const caretVariants = cva(
  'block size-[14px] text-primary transition-transform duration-200',
  {
    variants: {
      open: {
        true: 'rotate-90',
        false: 'rotate-0',
      },
    },
    defaultVariants: { open: false },
  },
);

// `.mobile-nav__dropdown{background:#1d1d1d}` — collapsible child list; animates max-height.
export const submenuVariants = cva('overflow-hidden bg-[#1d1d1d] transition-all duration-200', {
  variants: {
    open: {
      true: 'max-h-[40rem] opacity-100',
      false: 'max-h-0 opacity-0',
    },
  },
  defaultVariants: { open: false },
});

// `.mobile-nav__sublist-link{color:#8d8d8d}` — child link, indented.
export const childLinkClass =
  'block py-[12px] pl-[40px] pr-5 text-[#8d8d8d] transition-colors hover:text-inverse focus-visible:text-inverse focus-visible:outline-none';

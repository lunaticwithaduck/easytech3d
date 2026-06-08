import { cva } from 'class-variance-authority';

// Row shared by the accordion toggle and the leaf link.
export const rowClass =
  'flex w-full items-center justify-between gap-2 rounded-md px-3 py-3 text-left text-inverse transition-colors hover:bg-elevated/10 focus-visible:outline-none focus-visible:bg-elevated/10';

export const caretVariants = cva('text-primary transition-transform duration-200', {
  variants: {
    open: {
      true: 'rotate-90',
      false: 'rotate-0',
    },
  },
  defaultVariants: { open: false },
});

// Collapsible child list — animates max-height.
export const submenuVariants = cva('overflow-hidden transition-all duration-200', {
  variants: {
    open: {
      true: 'max-h-[32rem] opacity-100',
      false: 'max-h-0 opacity-0',
    },
  },
  defaultVariants: { open: false },
});

export const childLinkClass =
  'block rounded-md py-2 pl-7 pr-3 text-inverse/80 transition-colors hover:text-inverse focus-visible:outline-none focus-visible:text-inverse';

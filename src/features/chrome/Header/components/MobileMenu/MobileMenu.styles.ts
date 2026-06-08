import { cva } from 'class-variance-authority';

// Hamburger toggle — visible only below the desktop breakpoint.
export const hamburgerClass =
  'inline-flex size-10 items-center justify-center rounded-full bg-primary text-inverse transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden';

// Dimming overlay behind the drawer.
export const overlayVariants = cva(
  'fixed inset-0 z-50 bg-text/60 transition-opacity duration-200 lg:hidden',
  {
    variants: {
      open: {
        true: 'opacity-100',
        false: 'pointer-events-none opacity-0',
      },
    },
    defaultVariants: { open: false },
  },
);

// Slide-in drawer panel — dark surface matching the live mobile menu.
export const drawerVariants = cva(
  'fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-text text-inverse shadow-xl transition-transform duration-300 ease-out lg:hidden',
  {
    variants: {
      open: {
        true: 'translate-x-0',
        false: 'translate-x-full',
      },
    },
    defaultVariants: { open: false },
  },
);

export const drawerHeaderClass = 'flex items-center justify-between border-b border-muted/40 p-4';

export const drawerCloseClass =
  'inline-flex size-10 items-center justify-center rounded-full bg-primary text-inverse transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const drawerNavClass = 'flex-1 overflow-y-auto px-2 py-3';

export const drawerFooterClass = 'border-t border-muted/40 p-4';

export const drawerAccountClass =
  'flex items-center justify-center gap-2 rounded-full bg-elevated/10 px-4 py-3 text-inverse transition-colors hover:bg-elevated/20';

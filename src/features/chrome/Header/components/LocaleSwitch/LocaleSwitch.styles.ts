import { cva } from 'class-variance-authority';

export const localeSwitchClass =
  'hidden items-center gap-0.5 rounded-full border border-border p-0.5 sm:inline-flex';

// Each locale option pill. Active = primary fill; inactive = muted, hover to text.
export const localeOptionVariants = cva(
  'rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      active: {
        true: 'bg-primary text-inverse',
        false: 'text-muted hover:text-text',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

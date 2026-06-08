import { cva } from 'class-variance-authority';

// Toggle button — circular primary surface matching the other header icon actions.
export const searchToggleClass =
  'inline-flex size-10 items-center justify-center rounded-full bg-primary text-inverse transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

// Inline expanding field on desktop; the toggle reveals it on small screens.
export const searchFormClass = 'flex items-center gap-2';

// The field is hidden behind the toggle until opened.
export const searchFieldVariants = cva('overflow-hidden transition-all duration-200', {
  variants: {
    open: {
      true: 'w-44 opacity-100 sm:w-56',
      false: 'w-0 opacity-0',
    },
  },
  defaultVariants: {
    open: false,
  },
});

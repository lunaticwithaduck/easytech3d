import { cva } from 'class-variance-authority';

// Inline label + native <select> wrapper for the toolbar sort control.
export const sortWrapperVariants = cva('flex items-center gap-2');

// The native select, styled to read as a bordered pill with room for the chevron icon. We keep
// the real <select> for accessibility/keyboard support and overlay our own chevron.
export const sortFieldVariants = cva('relative inline-flex items-center');

export const sortSelectVariants = cva(
  'cursor-pointer appearance-none rounded-button border border-border bg-background py-2 pl-3 pr-9 text-sm text-text transition-colors hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
);

export const sortChevronVariants = cva(
  'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted',
);

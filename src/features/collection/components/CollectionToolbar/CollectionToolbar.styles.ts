import { cva } from 'class-variance-authority';

// Toolbar row: product count on the left, sort control on the right. Wraps and stacks on
// narrow viewports, divider underline like the theme's `filters-toolbar`.
export const toolbarVariants = cva(
  'flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between',
);

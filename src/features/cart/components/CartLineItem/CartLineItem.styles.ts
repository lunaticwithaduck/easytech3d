import { cva } from 'class-variance-authority';

// One cart row. Desktop: product cell | quantity | line total, matching the column header grid.
// Mobile: the cells stack, with quantity + total sharing a row under the product info.
export const rowClass =
  'grid grid-cols-1 items-center gap-4 border-border border-b py-6 md:grid-cols-[1fr_auto_auto] md:gap-6';

// Product cell: thumbnail + (title, variant, remove) stack.
export const productCellClass = 'flex items-start gap-4';

// Fixed-size square thumbnail with a rounded clip; the image fills it.
export const thumbnailClass =
  'relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-elevated';

export const thumbnailImageClass = 'object-cover';

// Title + variant + remove-link stack to the right of the thumbnail.
export const productInfoClass = 'flex min-w-0 flex-col gap-1';

export const productTitleClass = 'line-clamp-2';

// The inline remove control under the title — small, muted, with a leading icon.
export const removeButtonClass =
  'mt-1 inline-flex w-fit items-center gap-1 text-muted transition-colors hover:text-primary';

// On mobile the quantity + line total sit on one row; on desktop they are their own grid cells.
export const quantityCellClass = 'flex items-center justify-between gap-4 md:justify-center';

export const totalCellClass = 'flex items-center justify-between gap-4 md:min-w-24 md:justify-end';

// Mobile-only inline labels echoing the (hidden) desktop column headers.
export const mobileLabelClass = 'md:hidden';

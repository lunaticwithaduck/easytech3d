import { cva } from 'class-variance-authority';

// Two-column cart body on desktop (line items | order summary), single column on mobile.
export const cartLayoutClass = 'grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]';

// The line-items side: a header row of column labels + a divided list of rows.
export const lineItemsSideClass = 'flex flex-col';

// Column-header row, hidden on mobile where each row stacks its own labels.
export const columnHeaderClass =
  'hidden grid-cols-[1fr_auto_auto] items-center gap-6 border-border border-b pb-3 md:grid';

// The product column header sits left; price/qty/total headers align to their cells.
export const columnHeaderProductClass = 'text-left';

export const columnHeaderRightClass = 'min-w-24 text-right';

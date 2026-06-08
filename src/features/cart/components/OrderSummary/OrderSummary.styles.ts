import { cva } from 'class-variance-authority';

// The summary sidebar card: a bordered, padded block on the elevated surface. Sticks below the
// header as the line-items column scrolls on desktop.
export const summaryCardClass =
  'flex h-fit flex-col gap-4 rounded-lg border border-border bg-elevated p-6 lg:sticky lg:top-24';

// Subtotal row: label on the left, amount on the right.
export const subtotalRowClass = 'flex items-center justify-between border-border border-b pb-4';

// Full-width checkout button with its trailing arrow.
export const checkoutButtonClass = 'w-full';

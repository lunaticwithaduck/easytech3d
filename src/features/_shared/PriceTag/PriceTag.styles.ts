import { cva } from 'class-variance-authority';

// Layout for the price row: current price sits next to the struck compare-at price.
export const priceTagVariants = cva('inline-flex items-baseline gap-2');

// The original price shown alongside a sale price — muted + struck through.
export const compareAtVariants = cva('line-through');

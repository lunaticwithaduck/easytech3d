import { cva } from 'class-variance-authority';

// Page header band for the blog index — a muted strip carrying the breadcrumb trail, a small
// eyebrow, and the bold blog title, matching the Liquid `custom_page_header` heading block.
export const headerVariants = cva('flex flex-col gap-4 border-b border-border bg-elevated py-10');

export const headingGroupVariants = cva('flex flex-col gap-2');

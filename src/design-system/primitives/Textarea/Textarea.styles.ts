import { cva } from 'class-variance-authority';

export const textareaVariants = cva(
  'w-full min-h-28 rounded-md border border-border bg-paper px-3 py-2 text-base text-text placeholder:text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 resize-y',
);

export type TextareaVariants = Parameters<typeof textareaVariants>[0];

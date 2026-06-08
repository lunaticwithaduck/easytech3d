import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'w-full h-10 rounded-md border border-border bg-paper px-3 text-base text-text placeholder:text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      hasSuffix: {
        true: 'pr-10',
        false: '',
      },
    },
    defaultVariants: {
      hasSuffix: false,
    },
  },
);

export type InputVariants = Parameters<typeof inputVariants>[0];

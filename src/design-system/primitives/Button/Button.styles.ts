import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 shrink-0 rounded-button font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-inverse hover:bg-primary/90',
        secondary: 'bg-secondary text-text hover:bg-secondary/80',
        outline: 'border border-border bg-transparent text-text hover:bg-secondary/60',
        ghost: 'text-text hover:bg-secondary/60',
        destructive: 'bg-destructive text-inverse hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
        xl: 'h-14 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariants = Parameters<typeof buttonVariants>[0];

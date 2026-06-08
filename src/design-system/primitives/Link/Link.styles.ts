import { cva } from 'class-variance-authority';

export const linkVariants = cva('transition-colors', {
  variants: {
    variant: {
      default: 'text-text hover:text-primary',
      muted: 'text-muted hover:text-text',
      primary: 'text-primary hover:text-primary/80',
      nav: 'text-text hover:text-primary font-medium',
      unstyled: '',
    },
    size: {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type LinkVariants = Parameters<typeof linkVariants>[0];

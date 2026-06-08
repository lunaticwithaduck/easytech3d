import { cva } from 'class-variance-authority';

export const sectionVariants = cva('w-full py-12 md:py-16 lg:py-20', {
  variants: {
    background: {
      default: '',
      muted: 'bg-elevated',
      white: 'bg-background',
    },
  },
  defaultVariants: {
    background: 'default',
  },
});

export type SectionVariants = Parameters<typeof sectionVariants>[0];

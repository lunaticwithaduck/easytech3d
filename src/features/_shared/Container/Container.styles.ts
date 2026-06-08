import { cva } from 'class-variance-authority';

export const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      default: 'max-w-[1200px]',
      wide: 'max-w-[1440px]',
      narrow: 'max-w-[720px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export type ContainerVariants = Parameters<typeof containerVariants>[0];

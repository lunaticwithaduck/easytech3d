import { cva } from 'class-variance-authority';

export const sectionHeadingVariants = cva('flex flex-col gap-2', {
  variants: {
    align: {
      center: 'items-center text-center',
      left: 'items-start text-left',
    },
  },
  defaultVariants: {
    align: 'center',
  },
});

export const eyebrowClass = 'uppercase tracking-wide';

export type SectionHeadingVariants = Parameters<typeof sectionHeadingVariants>[0];

import { cva } from 'class-variance-authority';
import { textColor, textSize, textWeight } from '@/design-system/tailwindBridge';

export const textVariants = cva('', {
  variants: {
    size: textSize,
    weight: textWeight,
    color: {
      ...textColor,
      current: 'text-current',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'text',
  },
});

export type TextVariants = Parameters<typeof textVariants>[0];

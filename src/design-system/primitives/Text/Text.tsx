import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/lib/cn';

// Body / UI copy. The type scale + colours come from the @theme tokens (globals.css), so this is
// the single faithful source for text styling — no raw theme classes.
export const textVariants = cva('font-sans', {
  variants: {
    size: {
      h4: 'text-h4',
      h5: 'text-h5',
      eyebrow: 'text-eyebrow',
      base: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs',
      '2xs': 'text-2xs',
    },
    weight: { normal: 'font-normal', medium: 'font-medium', bold: 'font-bold' },
    color: {
      ink: 'text-ink',
      primary: 'text-primary',
      muted: 'text-ink/60',
      white: 'text-white',
      sale: 'text-sale',
      current: 'text-current',
    },
    leading: { none: 'leading-none', tight: 'leading-tight', snug: 'leading-snug', normal: 'leading-normal', relaxed: 'leading-relaxed' },
    uppercase: { true: 'uppercase' },
    nav: { true: 'font-nav' },
  },
  defaultVariants: { size: 'base', weight: 'normal', color: 'ink' },
});

export interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: ElementType;
  asChild?: boolean;
  /** Convenience for copy strings; falls back to children. */
  value?: string;
  children?: ReactNode;
}

export function Text({
  as: Tag = 'span',
  asChild = false,
  size,
  weight,
  color,
  leading,
  uppercase,
  nav,
  className,
  value,
  children,
  ...rest
}: TextProps) {
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp className={cn(textVariants({ size, weight, color, leading, uppercase, nav }), className)} {...rest}>
      {value ?? children}
    </Comp>
  );
}

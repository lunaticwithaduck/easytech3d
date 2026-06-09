import type { HTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/design-system/lib/cn';

// Headings — the exact responsive ladder from the theme (mobile size → desktop size at md).
// h1 56→80 · h2 40→52 · h3 26→40 · h4 19→22 · h5 18 · h6 14→16, weight 700, per-level tracking.
export const headingVariants = cva('font-sans font-bold text-ink', {
  variants: {
    level: {
      1: 'text-h1-m md:text-h1 tracking-[2px]',
      2: 'text-h2-m md:text-h2 tracking-[2px]',
      3: 'text-h3-m md:text-h3 tracking-[1px]',
      4: 'text-h4-m md:text-h4 tracking-[1px]',
      5: 'text-h5-m md:text-h5 tracking-[0.5px]',
      6: 'text-h6-m md:text-h6 tracking-[0.5px]',
    },
    color: { ink: 'text-ink', primary: 'text-primary', white: 'text-white', current: 'text-current' },
  },
  defaultVariants: { level: 2, color: 'ink' },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof headingVariants> {
  /** Visual level (font size). */
  level?: HeadingLevel;
  /** Semantic tag override (defaults to the level's tag, e.g. level 2 → <h2>). */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  asChild?: boolean;
  children?: ReactNode;
}

export function Heading({ level = 2, as, color, asChild = false, className, children, ...rest }: HeadingProps) {
  const Tag = (as ?? (`h${level}` as const)) as 'h1';
  const Comp = asChild ? Slot : Tag;
  return (
    <Comp className={cn(headingVariants({ level, color }), className)} {...rest}>
      {children}
    </Comp>
  );
}

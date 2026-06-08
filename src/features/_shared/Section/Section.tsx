import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';
import { sectionVariants } from './Section.styles';

export type SectionProps = {
  children: ReactNode;
  className?: string;
  background?: 'default' | 'muted' | 'white';
};

/**
 * A vertical band with consistent y-padding. `muted` = bg-elevated, `white` = bg-background,
 * `default` is transparent (inherits the page background). Callers compose Container inside.
 */
export function Section({ children, className, background = 'default' }: SectionProps) {
  return <section className={cn(sectionVariants({ background }), className)}>{children}</section>;
}

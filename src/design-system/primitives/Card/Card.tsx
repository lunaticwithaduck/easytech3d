import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';

// White rounded surface (radius 20px) — product cards, category tiles, collection cards.
export function Card({
  as: Tag = 'div',
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: ElementType; children?: ReactNode }) {
  return (
    <Tag className={cn('bg-surface rounded-card', className)} {...rest}>
      {children}
    </Tag>
  );
}

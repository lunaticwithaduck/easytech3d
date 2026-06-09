import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';

// The theme `.page-width`: max-width 1660px, centered, horizontal padding 55px (20px on mobile).
export function Container({
  as: Tag = 'div',
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: ElementType; children?: ReactNode }) {
  return (
    <Tag className={cn('mx-auto w-full max-w-page px-5 md:px-[55px]', className)} {...rest}>
      {children}
    </Tag>
  );
}

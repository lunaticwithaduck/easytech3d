import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';

// Centered content column. `default` = the theme `.page-width` (max 1660px); `small` = the theme
// `.page-width-small` (~1280px) used by the PDP, article, and other narrower content surfaces.
// Horizontal padding 55px desktop / 20px mobile either way.
export function Container({
  as: Tag = 'div',
  size = 'default',
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: ElementType; size?: 'default' | 'small'; children?: ReactNode }) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-5 md:px-[55px]',
        size === 'small' ? 'max-w-[1280px]' : 'max-w-page',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

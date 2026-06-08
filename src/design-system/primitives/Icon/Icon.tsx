import type { LucideIcon } from 'lucide-react';
import { cn } from '@/design-system/lib/cn';

export type IconProps = {
  /** A lucide-react icon component. */
  icon: LucideIcon;
  /** Square pixel size for width and height (default 20). */
  size?: number;
  className?: string | undefined;
};

export function Icon({ icon: IconComponent, size = 20, className }: IconProps) {
  return <IconComponent size={size} className={cn('shrink-0', className)} aria-hidden />;
}

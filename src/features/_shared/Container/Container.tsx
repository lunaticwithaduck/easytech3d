import type { ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';
import { containerVariants } from './Container.styles';

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
};

/**
 * Centered max-width layout wrapper with responsive horizontal padding.
 * `default` ~1200px, `wide` ~1440px, `narrow` ~720px.
 */
export function Container({ children, className, size = 'default' }: ContainerProps) {
  return <div className={cn(containerVariants({ size }), className)}>{children}</div>;
}

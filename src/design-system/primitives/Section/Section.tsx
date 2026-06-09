import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Text } from '@/design-system/primitives/Text/Text';
import { Heading } from '@/design-system/primitives/Heading/Heading';

// A home/page section band with consistent vertical rhythm.
export function Section({ className, children, ...rest }: HTMLAttributes<HTMLElement> & { children?: ReactNode }) {
  return (
    <section className={cn('py-10 md:py-14', className)} {...rest}>
      {children}
    </section>
  );
}

// The theme `.section-header`: centered eyebrow (`.h5` subtitle) above an `<h2>` title.
export function SectionHeader({
  eyebrow,
  title,
  className,
  align = 'center',
}: {
  eyebrow?: string;
  title?: string;
  className?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-2',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <Text size="eyebrow" weight="bold" color="primary" className="tracking-[0.5px]" value={eyebrow} />
      ) : null}
      {title ? <Heading level={2}>{title}</Heading> : null}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/design-system/lib/cn';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Text } from '@/design-system/primitives/Text/Text';

// A home/page section band. Bottom-only rhythm (~55px), matching the live site where inner blocks
// supply their own top spacing — avoids the doubled inter-section whitespace of symmetric padding.
export function Section({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement> & { children?: ReactNode }) {
  return (
    <section className={cn('pb-10 md:pb-14', className)} {...rest}>
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
        'mb-[55px] flex flex-col gap-[17.5px]',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {/* Live `.section-header .h5` eyebrow: ink, uppercase, 14px / 700 / +0.5px tracking, with a
          short leading rule ("— TEXT"). */}
      {eyebrow ? (
        <span className="inline-flex items-center gap-3">
          <span aria-hidden className="h-[2px] w-6 bg-ink" />
          <Text
            size="xs"
            weight="bold"
            color="ink"
            uppercase
            className="tracking-[0.5px]"
            value={eyebrow}
          />
        </span>
      ) : null}
      {title ? <Heading level={2}>{title}</Heading> : null}
    </div>
  );
}

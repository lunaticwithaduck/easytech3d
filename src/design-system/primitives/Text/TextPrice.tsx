'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/design-system/lib/cn';
import { type TextVariants, textVariants } from './Text.styles';

type TextPriceProps = TextVariants & {
  /** Amount in major currency units (e.g. 19.9 = 19.90 BGN). */
  amount: number;
  currency?: 'BGN' | 'EUR';
  className?: string;
};

// Locale-aware money formatting. The store sells in BGN with EUR display incoming —
// pass `currency` per the active price context.
export function TextPrice({
  amount,
  currency = 'BGN',
  size,
  weight = 'semibold',
  color,
  className,
}: TextPriceProps) {
  const locale = useLocale();
  const formatted = new Intl.NumberFormat(locale === 'bg' ? 'bg-BG' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);

  return <span className={cn(textVariants({ size, weight, color }), className)}>{formatted}</span>;
}

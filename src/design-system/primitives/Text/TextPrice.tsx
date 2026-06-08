import { cn } from '@/design-system/lib/cn';
import { type TextVariants, textVariants } from './Text.styles';

// Hardcoded BGN→EUR display ratio baked into the live theme's `product-price.liquid`
// (`assign converted_price = price_full | times: 0.51`). NOT the official lev/euro peg —
// it is the store's own dual-currency display factor and must be reproduced exactly.
const EUR_DISPLAY_RATIO = 0.51;

// Mirrors Shopify's `money_without_currency` filter for the BG store: two decimals, a `.`
// decimal separator and `,` thousands groups (e.g. `1,299.90`). Used for BOTH the лв amount
// and the converted € amount so the row reads `{lev} лв / {euro} €`.
function moneyWithoutCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

type TextPriceProps = TextVariants & {
  /** Amount in major currency units (e.g. 19.9 = 19.90 BGN). */
  amount: number;
  /** Kept for call-site compatibility; the store always displays лв + converted €. */
  currency?: 'BGN' | 'EUR';
  className?: string;
};

// Dual-currency money, server-safe (no hooks/client boundary) so it can be imported directly
// into server components. The store renders prices as `{lev} лв / {euro} €` where the euro is
// the lev amount × 0.51 (round to 2dp) — see snippets/product-price.liquid. The struck
// compare-at price elsewhere uses the same dual format; only its styling (line-through/muted)
// differs, applied by the caller.
export function TextPrice({
  amount,
  currency: _currency = 'BGN',
  size,
  weight = 'bold',
  color,
  className,
}: TextPriceProps) {
  const lev = moneyWithoutCurrency(amount);
  const euro = moneyWithoutCurrency(Number((amount * EUR_DISPLAY_RATIO).toFixed(2)));

  return (
    <span className={cn(textVariants({ size, weight, color }), className)}>
      {lev} лв / {euro} €
    </span>
  );
}

// Money formatting.
//
// Bulgaria adopted the euro on 2026-01-01 (fixed rate 1 EUR = 1.95583 BGN). The theme used to
// print a dual BGN/EUR string; that dual-display obligation ended 2026-08-08 and has been
// removed. All NEW money (catalog, cart, checkout, shipping) is EUR. Historical Shopify orders
// (#1001–#1146, imported pre-euro) stay priced in BGN and carry their own `currency` field —
// pass it through to `money()` when rendering an order.

/** Shopify `money_without_currency`: cents → "24.90" (2 decimals, dot). */
export function moneyWithoutCurrency(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** cents → "24.90 €" (EUR, the default), or "24.90 лв" for historical BGN orders. */
export function money(cents: number, currency: 'EUR' | 'BGN' = 'EUR'): string {
  const symbol = currency === 'BGN' ? 'лв' : '€';
  return `${moneyWithoutCurrency(cents)} ${symbol}`;
}

/** Percentage-off label (theme discount_mode == 'percentage'): "(compare - price) * 100 / compare | round" → "20%". */
export function percentSavings(priceCents: number, compareAtCents: number): string {
  return `${Math.round(((compareAtCents - priceCents) * 100) / compareAtCents)}%`;
}

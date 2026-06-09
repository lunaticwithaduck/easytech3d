// Money formatting — faithful to the theme.
//
// The live theme prints prices as a dual BGN/EUR string (snippets/product-price.liquid &
// product-price-listing.liquid):
//
//   {{ price_full | money_without_currency }} лв / {{ price_full | times: 0.51 | money_without_currency }} €
//
// i.e. the EUR value is the lev amount × 0.51 (the BGN→EUR peg the store uses), each rendered
// with 2 decimals and a dot separator: "27.00 лв / 13.77 €" (verified against the live mirror).

/** BGN → EUR factor the theme hard-codes. */
export const EUR_RATE = 0.51;

/** Shopify `money_without_currency`: cents → "24.90" (2 decimals, dot). */
export function moneyWithoutCurrency(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Shopify `money` for this store's BGN format: cents → "24.90 лв". */
export function money(cents: number): string {
  return `${moneyWithoutCurrency(cents)} лв`;
}

/** The dual "лв / €" string the product cards & PDP show. */
export function dualPrice(cents: number): string {
  const eur = Math.round(cents * EUR_RATE);
  return `${moneyWithoutCurrency(cents)} лв / ${moneyWithoutCurrency(eur)} €`;
}

/** Percentage-off label (theme discount_mode == 'percentage'): "(compare - price) * 100 / compare | round" → "20%". */
export function percentSavings(priceCents: number, compareAtCents: number): string {
  return `${Math.round(((compareAtCents - priceCents) * 100) / compareAtCents)}%`;
}

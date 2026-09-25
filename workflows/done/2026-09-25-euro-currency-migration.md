---
title: Euro currency migration (frontend)
created: 2026-09-25
status: done
completed: 2026-09-25
author: agent
tags: [money, i18n, currency]
priority: high
complexity: medium
---

# Euro currency migration (frontend)

## Description

Bulgaria adopted EUR on 2026-01-01 (fixed rate 1 EUR = 1.95583 BGN); the BGN/EUR
dual-display obligation ended 2026-08-08. Per `contracts/euro.md`, the backend now
returns catalog/cart/shipping-method money as EUR cents, and order payloads
(`ShopOrder`) carry a `currency: 'EUR' | 'BGN'` field (historical Shopify orders
#1001–#1146 stay BGN). This task lands the frontend side: single-currency EUR
display everywhere except historical BGN orders, and conversion of hard-coded
BGN copy (print-quote pricing) to EUR per the contract's fixed-rate table.

## Scope

- `src/lib/shopify/types.ts` — add `currency: 'EUR' | 'BGN'` to `ShopOrder`.
- `src/lib/shopify/money.ts` — remove `dualPrice`/`EUR_RATE`; `money(cents, currency = 'EUR')`.
- All `dualPrice`/`EUR_RATE` call sites → single EUR `money()`; order-money call
  sites pass `order.currency`.
- `src/components/quote/materials.ts`, `QuoteCalculator.tsx`,
  `PrintOnOrderTemplate.tsx` — per-gram prices, MIN_PRICE, all "лв" copy → "€"
  per the contract's conversion table.
- Any other hard-coded лв copy (grep) converted with `round(bgn/1.95583)`.
- `src/lib/seo.ts` JSON-LD `priceCurrency` BGN → EUR (catalog is EUR now).

## Acceptance Criteria

- [x] `ShopOrder.currency` added; order confirmation (`/orders/[id]`) and account
      order history render each order in its own currency.
- [x] `money.ts` dual-display + `EUR_RATE` removed; single `money(cents, currency)`.
- [x] Every dual-price call site (ProductPriceListing, ProductCard comment, Price
      primitive, cart/checkout/product money displays) converted to single EUR.
- [x] Print-quote per-gram prices/MIN_PRICE/FAQ copy converted per contract table.
- [x] Other hard-coded лв copy (announcement bar) converted.
- [x] `tsc --noEmit`, `lint:conventions`, `biome check` (touched files), and
      `next build` (with `BACKEND_API_URL`) all pass.

## Outcome

Completed on 2026-09-25. 21 files changed (20 `src/` files + this task file).

Key changes:
- `src/lib/shopify/types.ts`: `ShopOrder.currency: 'EUR' | 'BGN'` added.
- `src/lib/shopify/money.ts`: rewritten — `dualPrice`/`EUR_RATE` removed,
  `money(cents, currency = 'EUR')` → `"24.90 €"` / `"24.90 лв"` (BGN only).
- Every `dualPrice()` call site converted to single-currency `money()`:
  `CartDrawer.tsx`, `CartContents.tsx`, `CheckoutForm.tsx`, `ProductForm.tsx`,
  `QuickView.tsx`, `Price.tsx` (design-system primitive); `ProductPriceListing.tsx`
  rewritten to drop the EUR-conversion/dual-span logic entirely.
  `OrderConfirmation.tsx` and `OrderHistoryList.tsx` now pass `order.currency`
  through to `money()` so historical BGN orders keep rendering in лв.
- `materials.ts`: PLA/PLA Pro/PETG 0.55 → 0.2812 €/g, ABS 0.75 → 0.3835 €/g,
  ASA 0.80 → 0.4090 €/g, `MIN_PRICE` 10 → 5.11 €.
- `QuoteCalculator.tsx`: all 8 "лв"/"лв/г" strings → "€"/"€/г" (2-decimal display,
  4-decimal computation, per contract).
- `PrintOnOrderTemplate.tsx`: pricing table (0.28 €/г / 0.28 €/г / 0.28 €/г /
  0.38 €/г / 0.41 €/г) and FAQ copy (min order 5.11 €; free-shipping-over
  "150 лв" → "76.69 €" = round(150 / 1.95583)) converted.
- `src/data/settings.ts`: announcement-bar free-shipping copy "150лв" →
  "76.69 €" (same conversion).
- Stale BGN references cleaned up for consistency with the EUR backend:
  `src/lib/seo.ts` JSON-LD `priceCurrency` BGN → EUR; `src/data/catalog.ts`
  comments; `src/actions/cart.ts` / `src/components/layout/cart-store.ts`
  empty-cart `freeShippingThreshold` fallback 10500 (105.00 BGN) → 5369
  (53.69 € — the server's EUR threshold per contracts/euro.md).

Verification: `tsc --noEmit` clean, `node scripts/lint-conventions.cjs` clean
(24 files, 0 violations), `biome check` clean on all 20 touched files (one
formatting fix applied and re-verified), `BACKEND_API_URL=https://server-staging-c599.up.railway.app
next build` succeeded (all routes compiled/prerendered).

Committed and pushed to `origin/develop` as `7e55ec1`.

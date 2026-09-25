---
title: Euro currency migration (frontend)
created: 2026-09-25
status: in-progress
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

Completed on 2026-09-25. See final report for the full file list, converted
amounts and verification results.

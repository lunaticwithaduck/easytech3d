---
domain: medusa
source_task: 2026-09-25-medusa-storefront-migration.md
date: 2026-09-26
keywords: [medusa, store api, publishable key, customer auth, cart, checkout]
---

## Extracted Knowledge

- **Registration JWT is NOT a valid session token**, despite Medusa's own storefront guide
  ("How to register a customer") claiming otherwise. The token from
  `POST /auth/customer/emailpass/register` has an empty `actor_id` claim until the customer record
  exists; using it as-is against an authenticated route (e.g. `GET /store/customers/me`) 401s.
  After `POST /store/customers` succeeds (with the registration token as Bearer), you MUST call
  `POST /auth/customer/emailpass` (a normal login) again to get a token with `actor_id` populated.
  Verified live against a real Medusa v2 deployment, not just the docs.
- **Password reset token goes in the `Authorization: Bearer` header**, not a `?token=` query
  param, despite that being a common assumption/contract shorthand. The OpenAPI spec for
  `POST /auth/customer/{provider}/update` is `security: reset_password` — it's an authenticated
  route where the reset token IS the bearer token.
- **Field selection (`fields=`) sub-selectors don't work uniformly across relations.** On
  `GET /store/product-categories`, `fields=products.handle` or `+products.handle` silently drops
  the sub-selector and returns only `{id, title}` for each linked product — no error, just wrong
  data. The only way to get `handle` (or other scalar fields) on that relation is `*products`
  (full expansion of every linked entity), which is dramatically heavier (full description,
  images, variants, etc. per product). Always verify nested field selection live per-relation
  before trusting a query string from documentation or a spec.
- **Next.js's `fetch` data cache silently drops oversized entries** ("items over 2MB can not be
  cached") rather than failing the build — this is easy to miss because `next build` still
  succeeds and prints the warning inline with a wall of page-generation progress output. A single
  over-fetched relation (like the `*products` full-expansion above) is enough to trip it on a
  real-sized catalog. Prefer a second, narrow-field-list request over widening one query with a
  wildcard expansion when only a few scalar fields are actually needed.
- **Not every 2xx response is JSON.** Medusa's `POST /auth/customer/{provider}/reset-password`
  replies `201 Created` as `text/plain` with the literal body `Created`. A shared fetch client
  that unconditionally calls `res.json()` on `res.ok` will throw on this endpoint specifically.
  Check `content-type` before parsing.
- **A shipping method's `data` on a cart/order only contains what the client explicitly wrote to
  it at `POST /store/carts/{id}/shipping-methods` time** (e.g. `delivery_type`, `office_code`).
  Metadata that lives on the shipping *option* (like a `carrier` tag in `data.carrier`, set up by
  a courier module) is NOT automatically copied onto the method snapshotted onto the cart/order.
  If you need that info later (e.g. rendering an order confirmation), either duplicate it into the
  method's own `data` at attach time, or derive it from something that IS preserved (e.g. the
  method's `name`).
- **Money is major units, always.** `variant.calculated_price.calculated_amount`,
  `shipping_option.amount`, cart/order `item_total`/`total`/etc. are all floats like `19.94`, not
  cents. Convert once at the API boundary (`Math.round(amount * 100)`), never in display code.
- **Shipping option pricing already reflects cart context.** `GET /store/shipping-options?cart_id=`
  returns `amount` (and `calculated_price.calculated_amount`) already adjusted for
  cart-total-based price rules (e.g. free shipping over a threshold) — no need to reimplement that
  threshold logic client-side for the actual charge.

## Proposed Skill Content

A `medusa` skill should cover: the Store API's `x-publishable-api-key` + customer JWT auth model;
the register→create-customer→login-again gotcha; the reset-password Bearer-token gotcha; that
`fields=` sub-selection reliability varies by relation and must be spot-checked; the Next.js fetch
data-cache 2MB entry limit and how field selection can trip it; money is always major units; and
that cart-context shipping-option pricing already bakes in price-rule discounts.

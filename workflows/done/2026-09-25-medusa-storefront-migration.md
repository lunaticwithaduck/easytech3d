---
title: Re-point commerce data layer to Medusa
created: 2026-09-25
status: done
completed: 2026-09-26
author: agent
tags: [medusa, commerce, cart, checkout, accounts, courier]
priority: high
complexity: high
---

# Re-point commerce data layer to Medusa

## Description

Per `contracts/medusa-storefront.md`, the storefront moves catalog, cart, checkout,
order confirmation, and customer accounts off the old NestJS server
(`BACKEND_API_URL`, `src/lib/api/client.ts`) onto Medusa's Store API
(`MEDUSA_BACKEND_URL`, staging: https://backoffice-staging-92d4.up.railway.app).
Page design and routes are unchanged — only the data layer. Newsletter, contact,
back-in-stock and the 3D-print quote upload keep calling the old server. Courier
city/office lookups move to Medusa `GET /store/couriers/{carrier}/cities|offices`
(built in parallel by another owner — coded against the contract shape).

## Scope

- New seam `src/lib/medusa/*`: server-only fetch helper (`x-publishable-api-key` +
  customer JWT cookie), region resolution/caching, mappers Medusa → existing
  `Shop*` types (`src/lib/shopify/types.ts`), money major-units → cents
  (`Math.round(amount * 100)`).
- `src/data/catalog.ts` — products/categories/search via Medusa, same exported
  function signatures, same empty-fallback-on-error behaviour.
- `src/actions/cart.ts`, `src/actions/checkout.ts`, `src/actions/account.ts`,
  `src/actions/courier.ts` — rewritten against Medusa cart/order/auth/courier
  endpoints. Cart id stays in the `etd_cart` cookie; customer JWT stays in the
  `etd_customer` cookie.
- New password-reset flow: request + set-new-password pages/components, routes
  added to `@/config/routes`.
- Env: `MEDUSA_BACKEND_URL`, `MEDUSA_PUBLISHABLE_KEY` (server-only) added to
  `.env`/`.env.example`/Dockerfile ARGs.
- Remove dead code paths that called the old server for catalog/cart/checkout/
  accounts/courier.

## Acceptance Criteria

- [x] Catalog reads (products, categories, search, related) go through Medusa;
      empty-catalog / unreachable-Medusa fallback still renders (no crash).
- [x] Cart + checkout (address/office delivery, Econt/Speedy, COD via
      `pp_system_default`) go through Medusa; order confirmation renders from
      `GET /store/orders/{id}`.
- [x] Customer accounts (register/login/logout/me/order history) go through
      Medusa auth; new password-reset request + confirm pages added.
- [x] Courier city/office lookup goes through Medusa's new courier routes.
- [x] Newsletter/contact/back-in-stock/print-quote untouched (still
      `BACKEND_API_URL`).
- [x] `tsc --noEmit`, `lint:conventions`, `biome check` (touched files), and
      `next build` all pass with `MEDUSA_PUBLISHABLE_KEY` unset (empty-catalog
      fallback path).

## Outcome

Completed on 2026-09-26. The staging Medusa store (https://backoffice-staging-92d4.up.railway.app)
had real data by the time this finished (149 products, 21 categories, the "България" EUR region,
Econt/Speedy shipping options, `pp_system_default`) — every endpoint below was exercised live with
curl (create cart → add line item → address → shipping method → payment collection/session →
complete → fetch as guest and as a logged-in customer; register → login → customers/me →
orders; courier cities/offices), not just built against the OpenAPI spec.

**Seam** (`src/lib/medusa/`):
- `client.ts` — `medusaFetch()`, a server-only fetch wrapper mirroring `apiFetch`'s shape: adds
  `x-publishable-api-key` (`MEDUSA_PUBLISHABLE_KEY`) and the customer JWT from the `etd_customer`
  httpOnly cookie as `Authorization: Bearer` (opt-out via `withCustomerAuth: false`, override via
  `bearerToken`). `MedusaApiError`. Skips `res.json()` when the response isn't
  `application/json` (the reset-password-token endpoint replies `201 text/plain`, which broke a
  blind `.json()` call during live testing).
- `region.ts` — `getRegion()`/`getRegionId()`, resolves the BG region from `GET /store/regions`
  once and memoizes it (module-level, not cached on failure so a later call retries once Medusa/the
  key comes up).
- `mappers.ts` — Medusa → `Shop*` mappers (`mapProduct`, `mapProductStub`, `mapCategory`,
  `mapCart`, `mapShippingOption`, `mapOrder`, `mapCustomer`, `mapCourierCity`,
  `mapCourierOffice`) plus the loose Medusa response-shape interfaces they consume. `toCents()` is
  the money boundary (`Math.round(amount * 100)`), including reading
  `variant.metadata.compare_at_amount` (EUR major units, no native Medusa compare-at).

**Catalog** (`src/data/catalog.ts`): same exported function signatures as before
(`getCollections`, `getCollection`, `getProductsInCollection`, `getProduct`, `getAllProducts`,
`getRelatedProducts`, `searchCatalog`/`searchProducts`); `getArticles`/`getArticle`/`getBlog` are
untouched static placeholders (blog hasn't moved off Shopify). All list/single reads keep the old
`orDefault`/`orUndefined` degrade-to-empty behaviour on any Medusa error. Sorting for
price-ascending/descending and title-ascending/descending happens client-side after the fetch
(Medusa has no calculated-price `order=` support); `manual`/`best-selling`/`created-descending`
fall back to natural order (no merchandising rank or sales-count field wired up in Medusa yet).

**Cart/checkout** (`src/actions/cart.ts`, `src/actions/checkout.ts`): cart id stays in the
`etd_cart` httpOnly cookie exactly as before. `submitCheckout` runs the full Medusa flow — link
cart to customer (if logged in) → update cart (email + shipping/billing address) → match a
`GET /store/shipping-options?cart_id=` result to the chosen carrier → attach it via
`POST /store/carts/{id}/shipping-methods` → `POST /store/payment-collections` →
`POST /store/payment-collections/{id}/payment-sessions` with `provider_id: 'pp_system_default'`
(cash on delivery) → `POST /store/carts/{id}/complete`. Free shipping (item_total ≥ 53.69 €) is
already reflected in the shipping option's `amount` field when queried with `cart_id` — no
client-side threshold math needed for the actual charge (the 53.69 € constant is only used for the
cart drawer's progress bar / "remaining to free shipping" copy).

**Accounts** (`src/actions/account.ts`): register is the two-step Medusa flow
(`/auth/customer/emailpass/register` → `POST /store/customers` with that token as Bearer),
**plus a mandatory extra login call** (see contract gap below) — the session JWT ends up in the
same `etd_customer` cookie the old seam used, so `LogoutButton`/`AccountLink`/account pages needed
no changes. New password-reset flow: `RequestPasswordResetForm` + `SetNewPasswordForm`
(`src/components/account/`), pages at `routes.account.resetPassword` (`/account/reset-password`)
and `routes.account.resetPasswordConfirm` (`/account/reset-password/confirm`, reads
`?token=&email=` from the emailed link), a "Забравена парола?" link added to `AuthForms`.

**Courier** (`src/actions/courier.ts`): `getCourierCities`/`getCourierOffices` now call
`GET /store/couriers/{carrier}/cities|offices` (verified live — the courier owner's module was
already deployed on staging). `EcontCity`/`EcontOffice` renamed to carrier-agnostic
`CourierCity`/`CourierOffice` in `src/lib/shopify/types.ts` to match the new shape (`id`, `name`,
`postCode`, `region` / `code`, `name`, `address`, `type: 'office'|'locker'`).
`CheckoutForm.tsx` reworked from name-keyed city lookup to id-keyed (`city_id` is required by the
offices endpoint), and now reads the selected city's own `postCode`/`name` for the shipping
address since the office record itself carries neither (only `code`/`name`/`address`/`type`).

**Untouched (still `BACKEND_API_URL` / `src/lib/api/client.ts`)**: `src/actions/forms.ts`
(newsletter, contact, back-in-stock) and `src/app/api/print-quote/route.ts` (STL upload), per the
contract.

**Env / Docker**: `MEDUSA_BACKEND_URL` + `MEDUSA_PUBLISHABLE_KEY` added to `.env`/`.env.example`
(with comments) and as Dockerfile build `ARG`s next to `BACKEND_API_URL`.

**Contract gaps found (all live-verified against staging, not guessed)**:
1. **Registration token doesn't work as a session token.** Medusa's own "Register a customer"
   storefront guide says the registration JWT becomes the valid session after
   `POST /store/customers` succeeds, with "no additional login call needed." Live-tested and
   false: the registration token's `actor_id` claim is empty (`""`) until a customer exists, and
   using it as-is against `GET /store/customers/me` 401s. Fixed by adding a normal
   `POST /auth/customer/emailpass` login call right after customer creation and using *that*
   token for the session cookie.
2. **Reset-password token isn't a query param.** The contract's literal shape,
   `POST /auth/customer/emailpass/update?token=…`, doesn't match the actual OpenAPI spec: `update`
   is `x-authenticated: true` / `security: reset_password`, meaning the token goes in the
   `Authorization: Bearer` header, not a query string. Implemented per the real spec
   (`setNewPassword` passes the token as `bearerToken`).
3. **No related-products endpoint.** The contract doesn't specify one. Implemented as "other
   products sharing the product's first category, excluding itself" via
   `GET /store/products?category_id[]=…`.
4. **Shipping method `data.carrier` isn't preserved on the order.** The contract's
   `POST /store/carts/{id}/shipping-methods` body only carries `delivery_type`/`office_code`/
   `office_name` in `data` (matches the contract literally) — `carrier` lives on the shipping
   *option* (`GET /store/shipping-options` — confirmed live), not the method snapshotted onto the
   cart/order. `mapOrder` derives the carrier from the shipping method's localized `name`
   ("Еконт"/"Спиди") instead.
5. **Nested field selection on `product-categories.products` doesn't work.** `fields=` values like
   `products.handle` or `+products.handle` silently ignored the sub-selector and always returned
   `{id, title}` only (verified live 2026-09-26). The contract's own literal example,
   `fields=*products` (full expansion), does return `handle`, but pulls every member product's
   *entire* body — this blew past Next.js's 2MB data-cache entry size limit for a real category
   during a `next build` smoke test. Fixed by NOT requesting `products` on the category fetch at
   all and instead running a separate cheap `GET /store/products?category_id[]=…&fields=id,handle,title`
   read (also gives an accurate `count` for `productsCount`, capped at 30 for the JSON-LD stub
   list `collectionLd` already caps at).
6. **Courier city id is numeric**, not a string (`{id: 1, name: "Айтос", ...}`) — `CourierCity.id`
   stays `string` on our side (only used to build query strings) but the raw Medusa shape is
   normalized with `String(c.id)`.

**Verification**: `tsc --noEmit` clean; `node scripts/lint-conventions.cjs` clean (26 files);
`biome check` clean on all touched files; `next build` succeeds in all three tested configurations
— full `MEDUSA_PUBLISHABLE_KEY` + real data (149 products, 21 categories, no data-cache warnings),
`MEDUSA_BACKEND_URL` set but no publishable key (empty-catalog fallback, still succeeds), and the
committed `.env`'s defaults. Full cart→shipping→COD-payment→complete flow and
register→login→customer-linked-order flow verified live against staging with curl (not just unit
logic) — see the contract-gap list above for what that testing actually caught.

Branch `feat/medusa`, pushed to origin. Not merged into `develop`, not deployed (per the brief —
the manager integrates).

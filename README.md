# easytech3d-web

Storefront **frontend** for [easytech3d.com](https://www.easytech3d.com/) — a rebuild that
drops Shopify and owns the codebase. **The backend is a separate repo/service**; this app
consumes it over HTTP. Built on the majstorbg design-system philosophy, scaled down to a
single app (no monorepo, no package publishing).

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** strict
- **Tailwind CSS 4** with a token-driven `@theme` (no JS config)
- **next-intl** (BG-primary, EN) — bundled JSON messages
- **Radix** primitives · **CVA** + `cn()` for variants · **motion** for interaction
- **Biome** (lint/format) + a custom **convention linter** (R1–R8)
- Data fetching: **RSC reads + Server Actions** against the external backend (thin BFF)

## Getting started

```sh
pnpm install
cp .env.example .env        # set BACKEND_API_URL etc.
pnpm theme:generate         # tokens.ts → theme.css (also runs in CI/build)
pnpm dev                    # http://localhost:3000  → redirects to /bg
```

## Scripts

| script | what |
|---|---|
| `pnpm dev` / `build` / `start` | Next.js dev / production build / serve |
| `pnpm theme:generate` | regenerate `src/design-system/theme.css` from tokens |
| `pnpm lint` | Biome check |
| `pnpm lint:conventions` | the design-system convention linter (R1–R8) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm e2e` | Playwright |

## Structure

```
src/
  app/
    layout.tsx              root (passes children through)
    globals.css             @import tailwindcss + theme.css + font var
    fonts.ts                Instrument Sans (the ONLY next/font import — R8)
    [locale]/
      layout.tsx            <html>/<body> + NextIntlClientProvider
      page.tsx              home (proof-of-life using the design system)
  design-system/            ← the masterclass layer (exempt from the convention linter)
    tokens.ts               colors + radius (single source of truth)
    typography.ts           size/weight/leading/tracking scales
    tailwindBridge.ts       token → class-name maps for CVA
    theme.css               GENERATED — do not edit
    lib/cn.ts               clsx → tailwind-merge
    scripts/generate-theme.cjs
    primitives/             Text (+ TextPrice), Button, Link, Image
  features/                 cross-route domain UI (product, collection, cart, …) — to come
  i18n/                     routing · navigation · request · translate · messages/{bg,en}.json
  config/routes.ts          typed route table (the only source of hrefs — R7)
  lib/api/client.ts         seam to the external backend (no endpoints yet)
  middleware.ts             next-intl locale middleware
scripts/lint-conventions.cjs
```

## Conventions (enforced by `pnpm lint:conventions`)

Screens in `src/app` and `src/features` must:
- use **design-system primitives** — no raw `<p>/<h1-6>/<button>/<input>/<a>/<img>/<label>` (R3)
- route copy through `<Text value="…" />` (translatable) — runtime data stays as children (R3)
- use **tokens** — no hex, no arbitrary Tailwind values; inline styles go in `*.styles.ts` (R1, R4)
- one component per file (R5); hrefs via `@/config/routes` (R7); fonts only from `app/fonts.ts` (R8)

Primitives in `src/design-system/**` are the exception — they own the raw HTML.

## Out of scope (this scaffold)

The **backend** (separate repo), and the commerce surfaces that depend on product decisions:
**checkout/payments** (Stripe + cash-on-delivery + Econt/Speedy couriers), **admin**, and
**customer accounts**. The data layer is a seam (`lib/api/client.ts`) ready for endpoints once
the backend contract exists. Design reference + tokens live in [`tools/`](tools/).

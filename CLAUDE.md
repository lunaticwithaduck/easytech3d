# easytech3d

A rebuild of **[www.easytech3d.com](https://www.easytech3d.com/)** — a Bulgarian Shopify
store selling 3D-printing consumables and parts (filaments: PLA/PETG/ABS/ASA/PLA-Flex/HiTPLA,
resins, nozzles, beds, BLTouch sensors, accessories). The brief: replicate the live site
**~1:1**, then own the stack instead of Shopify's theme.

**Status as of 2026-06-08**: Frontend scaffolded and building (Next.js 16 + Tailwind 4 +
next-intl, design-system ported from majstorbg). The **backend is a separate repo** (consumed
over HTTP) — out of scope here. Commerce surfaces (checkout/payments, admin, customer accounts)
are deferred. See [README.md](README.md) for the app; this file is the project brief + reference.

## Read this before starting work

[`tools/FINDINGS.md`](tools/FINDINGS.md) is the authoritative summary of the captured reference:
- **Coverage**: 68 routes — every non-product page (home, all collections, all blog posts,
  contact, policies, 3D-print-on-order, cart/search/404 templates) + a 16-of-150 sample of
  product detail pages. Verified complete via `pnpm gap`.
- **Brand**: font **Instrument Sans** (400/700; 15/16/22px ladder). Accent **`#ff1b5c`**
  (magenta-pink) on near-black `#232323` text over white / `#f4f4f4` / `#f7f7f7` surfaces.
- **Stack of the original**: Shopify (Dawn-family theme), Cloudflare CDN, BG-primary + EN.

[`tools/output/design-tokens/`](tools/output/design-tokens/) holds machine-generated design
tokens (CSS variables, Tailwind theme, JSON) derived from the references — drop-in for the
new stack. Regenerate with `pnpm -C tools tokens`.

## Artifacts

Everything is under [`tools/output/`](tools/output/) (gitignored). To regenerate, see
[`tools/README.md`](tools/README.md).

| What | Where |
|---|---|
| **Local mirror of the live site** | `tools/output/reference/mirror/` — **start here for design work** |
| Per-route design brief | `tools/output/reference/design-notes.md` |
| Structured digest (typography/colors/spacing/sections) | `tools/output/reference/design-data.json` |
| Per-route HTML + desktop/mobile screenshots + section crops | `tools/output/reference/pages/<slug>/` |
| Brand palette JSON + swatch sheet | `tools/output/palette/palette.json` · `palette.html` |
| Design tokens (CSS / Tailwind / JSON) | `tools/output/design-tokens/` |
| Coverage proof | `tools/output/reference/gap-check.json` |

## Browsing the reference

```sh
cd tools
pnpm ref:serve     # → http://localhost:4173/_index.html
```

A real working local copy of the live site (Shopify CDN assets load over the network). Click
between all 68 pages, inspect real CSS, resize for responsive. This is the primary design
reference; the screenshots are the offline-durable archive.

## The agentic workflow (`.claude/`)

This repo carries a full multi-agent workflow. Reach for it as the work grows:
- **`skills/orchestrator`** — the router: maps a task to the right specialist skill(s).
- **Skills** — `frontend`, `react`, `nextjs`, `ui-ux-designer`, `seo`, `testing`, `payments`,
  `backend`, `data-state`, `realtime`, `deployment`, `devops`, `security`, and more.
- **Agents** — `architect`, `worker`, `refactorer`, `security`, `devops`, `project-manager`,
  and `qa` (Playwright verify-before-done).
- **Commands** — `/idea`, `/complete`, `/promote`, `/preserve`, `/diagram`, `/security`.
- **Hooks** — secret-blocking, skill auto-detection, post-write/stop housekeeping (`settings.json`).

## Stack (chosen)

Single frontend app (no monorepo) — backend is a separate repo. Full detail in [README.md](README.md).
- **Next.js 16** App Router · **React 19** · **TypeScript** strict · **Tailwind 4** (token `@theme`)
- **next-intl** (BG-primary, EN; bundled JSON) · **Radix** + **CVA** + `cn()` · **motion**
- Reads via **RSC**, mutations via **Server Actions** against the external backend (thin BFF;
  seam at [src/lib/api/client.ts](src/lib/api/client.ts))
- Design-system ported from `../majstorbg/packages/webui` into [src/design-system/](src/design-system/),
  wired to the captured tokens · convention linter at [scripts/lint-conventions.cjs](scripts/lint-conventions.cjs)
- Font: **Instrument Sans** (Cyrillic falls back — see [src/app/fonts.ts](src/app/fonts.ts))

## Conventions

- Tooling lives in `tools/` (self-contained, re-runnable; outputs to `tools/output/`).
- Don't commit `tools/output/` or `tools/node_modules/` (gitignored).
- When building UI, default to mirroring the live site's structure (Shopify Dawn-family:
  header → stacked content sections → footer), reskinned with the captured tokens.
- Product *detail* pages are sampled, not exhausted — see `tools/FINDINGS.md` to capture more.

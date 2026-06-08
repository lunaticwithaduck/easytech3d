# easytech3d-tools

Site-teardown tooling for **[easytech3d.com](https://www.easytech3d.com/)** — a Shopify store.
It produces a high-accuracy design reference of the live site: a browseable local mirror,
desktop + mobile screenshots of every page (with per-section crops), a computed-style
digest (typography / colors / spacing / layout), and an extracted brand palette.

Adapted from the topkvartiri pre-scaffold tooling. The main additions for this Shopify
target are **sitemap-seeded route discovery** and **parallel capture/mirror** — it's our
own site, so the scripts run a little aggressively by default.

## Quick start

```sh
cd tools
pnpm install            # also runs `playwright install chromium`

pnpm scan               # crawl → capture → mirror (the full reference)
pnpm palette            # derive the brand palette from the home page
pnpm ref:serve          # browse the mirror at http://localhost:4173/_index.html
```

`pnpm all` runs palette + scan in one go. All output lands under `tools/output/` and is
gitignored — re-running overwrites.

## Pipeline

| step | script | what it does |
|------|--------|--------------|
| `ref:crawl`   | `crawl-reference.cjs`   | Discover routes. **Sitemap mode (default):** reads `/sitemap.xml` + sub-sitemaps (keeps all pages/collections/blogs, samples products), **harvests** hub-page links the sitemap omits (`/policies/*`, noindex pages, `/collections`, `/collections/all`), and injects **system templates** (cart, search, 404). Falls back to same-origin BFS. Writes `routes.json`. |
| `gap`         | `gap-check.cjs`         | Independently harvests every internal link from the hub pages and diffs against the captured route set — proves no non-product content page is missing. Writes `gap-check.json`. |
| `ref:capture` | `capture-reference.cjs` | Per route: dismiss cookie banner, exhaustively scroll lazy content, take desktop (1440×900) + mobile (390×844) full-page screenshots, try the mobile nav drawer + a product-media lightbox, dump HTML, and compute a style digest. Crops each top-level `<section>` into its own PNG. Writes `design-notes.md` + `design-data.json`. |
| `ref:mirror`  | `mirror-reference.cjs`  | Saves the rendered HTML of every route and rewrites absolute origin URLs so it serves from a local origin. (Shopify theme assets live on `cdn.shopify.com`, so the mirror is fully styled when viewed online; the capture screenshots are the offline-durable reference.) Writes `_index.html`. |
| `ref:serve`   | `serve-mirror.cjs`      | Zero-dep static server for the mirror on port 4173 (`PORT=8000 pnpm ref:serve` to change). |
| `palette`     | `extract-palette.cjs`   | Hybrid palette: computed-CSS color frequencies (area/text weighted) **+** pixel k-means in Lab, merged and de-duplicated for variety. Writes `palette.json`, `palette-raw.json`, `palette.html` (open in a browser). |
| `tokens`      | `extract-tokens.cjs`    | Derives a starting design system from `palette.json` + `design-data.json` — semantic colors, font family + size ladder + weights, spacing scale, radii. Writes `output/design-tokens/{tokens.json, tokens.css, tailwind.tokens.cjs}`. Run after `palette` + `scan`. |

## Useful flags

```sh
# crawl
pnpm ref:crawl --products=24            # keep more product pages (default 16)
pnpm ref:crawl --max=200                # raise the overall route cap (default 120)
pnpm ref:crawl --bfs --depth=3 --max=80 # force link-graph BFS instead of the sitemap
pnpm ref:crawl --no-sitemap             # same — skip the sitemap

# capture / mirror
pnpm ref:capture --concurrency=6        # parallel routes (default 4)
pnpm ref:capture --skip-mobile          # desktop only (faster)
pnpm ref:mirror  --concurrency=6
pnpm ref:capture --headed --slowmo=100  # watch it run (forces serial)

# palette
pnpm palette --url=https://www.easytech3d.com/collections/all
pnpm palette --k=12 --top=8             # more clusters / more final swatches
```

Every script also accepts `--url=` (crawl/palette) or `--routes=<path>` (capture/mirror).
After `ref:crawl`, you can hand-prune `output/reference/routes.json` before the heavier
capture/mirror steps.

## Notes

- The canonical host is `www.easytech3d.com` (the apex 301-redirects there); the defaults
  already point at `www`.
- Cart / checkout / account / search / Shopify-internal routes are filtered out of the
  route set — they're funnels, not design references.
- `node` 20+ required (the crawler uses global `fetch` for sitemap reads). Tested on 22.

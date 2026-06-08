# easytech3d.com — reference teardown findings

High-accuracy design reference of **[www.easytech3d.com](https://www.easytech3d.com/)**
(Bulgarian Shopify store — 3D-printing filaments, resins & parts), captured for a near-1:1
rebuild. All artifacts under `tools/output/` (gitignored; re-runnable).

Goal per the brief: gather references from **every page except product *details*** (product
detail pages are sampled as a template, not exhausted).

## TL;DR

- **68 routes captured.** Coverage of **non-product content pages is 100%** — verified by an
  independent link-harvest gap-check (`pnpm gap`): *no nav/footer-linked content page is missing.*
- Platform: **Shopify** (theme "Dawn"-family), Cloudflare CDN, BG-primary + EN. Canonical host
  is `www.` (the apex 301s there).
- Route discovery = **sitemap** (authoritative for products/collections/blogs/pages) **+ hub-link
  harvest** (catches what the sitemap omits: `/policies/*`, the "3D print on order" page,
  `/collections`, `/collections/all`) **+ injected system templates** (cart, search, 404).
- **Brand**: font **Instrument Sans** (400/700; 15/16/22px ladder). Accent **`#ff1b5c`**
  (magenta-pink) on near-black `#232323` text over white / `#f4f4f4` / `#f7f7f7` surfaces.
- Outputs: **204 full-page screenshots** (68 × desktop + mobile + mobile-nav), **198 per-section
  crops**, 68 HTML dumps + style digests, a **583-file / 37.5 MB browseable local mirror**, and
  an 8-swatch palette.

## Coverage (what was captured)

| type | count | policy | notes |
|------|------:|--------|-------|
| home | 1 | all | landing, 6350px tall |
| pages | 7 | all | `contact`, `общи-условия` (terms), `3d-принт-при-поръчка` (3D-print-on-order) + 4 auto-generated Shopify `*-sitemap` pages (machine noise — prunable) |
| collections | 24 | **all** | every collection listing + `/collections` (all-collections) + `/collections/all` (all-products) |
| blog | 14 | **all** | blog index + all 13 articles |
| policies | 3 | **all** | privacy, refund, terms-of-service (footer; absent from sitemap) |
| products | 16 | **sample of 150** | detail-page **template** only — *deliberately not exhausted* per the brief |
| system | 3 | all | `cart`, `search` results, themed `404` — distinct templates the sitemap omits |
| **total** | **68** | | source: sitemap 58 · harvest 7 · system 3 |

**Product detail pages**: 150 exist; 16 are captured as an even alpha-sample spanning every
category (filaments, resins, parts, beds, nozzles…) so the detail template is well-referenced.
To capture more: `pnpm ref:crawl --products=40` (or `--products=150` for all), then re-capture.

## Coverage proof (gap-check)

`pnpm gap` independently harvests every internal link from the hub pages (home, `/collections`,
`/collections/all`, blog index) and diffs them against the captured route set:

```
SUMMARY: PASS — no non-product content page is missing. Coverage of linked pages is complete.
```

Excluded as non-content noise (correctly): `.atom` feeds, `/blogs/.../tagged/*` tag views,
theme `/tab_*` fragments, a Liquid-error placeholder link, `/customer_authentication/*`, and the
134 product URLs beyond the sample.

## Brand palette (home page)

Hybrid extraction (computed-CSS frequency + pixel k-means in Lab). Full data in
[output/palette/palette.json](output/palette/palette.json); swatches in
[output/palette/palette.html](output/palette/palette.html).

| # | hex | role | signal |
|---|-----|------|--------|
| 1 | `#232323` | body text (near-black) | dominant `color`, weight 86k |
| 2 | `#ffffff` | primary background | large bg areas |
| 3 | `#f4f4f4` | surface / section bg | secondary bg |
| 4 | `#ff1b5c` | **brand accent** (magenta-pink) | buttons / highlights, weight ~3.9k |
| 5 | `#f7f7f7` | surface (warm white) | section bg |
| 6 | `#ebebeb` | hairlines / muted | borders |
| 7 | `#fd5b2a` | secondary accent (orange) | small fills |
| 8 | `#ea0606` | sale/alert red | price/sale tags |

## Typography

- **Single family: Instrument Sans** (Google Fonts), weights 400 / 700.
- Size ladder (px): 15 / 16 (body) → 22 (sub-headings) → larger on hero (see per-page digests).
- Clean geometric sans; no serif.

## Tech stack

- **Shopify** (Dawn-family theme: `summary.header__icon--menu` drawer nav, `product-media-modal`
  lightbox, `#shopify-pc__banner__btn-accept` consent — all wired into the capture selectors).
- Cloudflare in front; assets on `cdn.shopify.com` (so the local mirror is fully styled online,
  HTML-only offline — the screenshots are the offline-durable reference).
- BG primary content with an EN switch (`<html lang>` resolved to `en` on capture).

## How to use the artifacts

1. **Browse the mirror** — `pnpm ref:serve` → http://localhost:4173/_index.html. Click between
   all 68 pages, inspect real CSS, resize for responsive.
2. **Per-page references** — `output/reference/pages/<slug>/`: `desktop.png`, `mobile.png`,
   `mobile-menu-open.png`, `page.html`, and `sections/NN-*.png` (one crop per visual band).
3. **Per-page briefs** — [output/reference/design-notes.md](output/reference/design-notes.md)
   (typography, colors, spacing, section tree, nav, components per route).
4. **Raw digest** — [output/reference/design-data.json](output/reference/design-data.json).
5. **Palette** — source tokens 1–6 above; skip 7–8 unless you want the sale-tag colors.

## Re-running

```sh
cd tools
pnpm scan        # crawl (sitemap+harvest+system) → capture → mirror
pnpm palette     # re-derive the brand palette
pnpm gap         # re-verify non-product coverage
```

## Known gaps / notes

- **Product details are sampled (16/150) by design** — raise with `--products=N` if you want more.
- **4 `*-sitemap` pages** under `/pages/` are Shopify's auto-generated HTML sitemaps — captured
  but non-design noise; prune from `routes.json` if undesired.
- **Mirror offline fidelity**: Shopify serves CSS/JS/images from `cdn.shopify.com`, left external
  by design — the mirror is fully styled when viewed with a connection. A few very long Cyrillic
  blog slugs are stored under hashed filenames (Windows MAX_PATH); their in-page links may not
  resolve offline, but the page HTML + screenshots are saved.
- **Russian**: site is BG/EN only (no RU), unlike the topkvartiri reference this tooling came from.

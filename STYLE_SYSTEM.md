# Design System & Migration Guide

We are migrating the storefront's styling **off the raw global theme CSS** and **into a real design
system** (Tailwind 4 `@theme` tokens + CVA primitive components). The verbatim Liquid translation
proved the exact markup/values; this phase re-expresses each surface through primitives.

## The rules

1. **Migrated surfaces use ONLY the design system** — primitives from `@/design-system` + Tailwind
   utilities built from our `@theme` tokens. **No theme class names** (`.btn`, `.product-card`,
   `.page-width`, `.grid__item`, `.section-header`, …) on migrated markup, and **no inline `style`**
   except for genuinely dynamic values (e.g. a slide's overlay opacity).
2. The live theme CSS still loads (via `<link>`) as a **backstop for un-migrated surfaces only**.
   Tailwind utilities are imported **unlayered** so they win over the theme's element selectors on
   your clean (theme-class-free) markup. If you leave a theme class on a migrated element, the
   backstop CSS will fight your utilities — so strip them.
3. **Do not eyeball.** Get exact values by probing the live site (or the current faithful localhost
   render) and bake them in. Tool:
   `node tools/verify/shoot.cjs <url> <outBase> <selector> [selector…] > out.json 2>&1` then read
   `out.json` for computed styles (font-size/weight/color/padding/radius/…). Compare
   `https://easytech3d.com/<route>` to `http://localhost:3001/bg/<route>`.
4. **`'use client'`** only where there's real interactivity (tabs, carousels, mobile drawer, search
   input, quantity). Otherwise keep Server Components.
5. Keep each component's **props/exports unchanged** (the pages/layout import them) — only change the
   internals from theme markup to primitives. Build must stay TypeScript-clean.

## Import surface

```ts
import {
  cn, Text, Heading, Button, Link, Container, Section, SectionHeader,
  Card, Price, ProductLabel, Image, Input, Textarea, Icon,
} from '@/design-system';
import { ProductCard } from '@/components/product/ProductCard'; // shared card (already migrated)
import { Rte } from '@/components/snippets/Rte';                // trusted HTML
```

- `Link` is locale-aware (keeps `/bg`). Use for internal `/…` hrefs; plain `<a>` for external/anchors.
- `Image` wraps `next/image` (cdn.shopify.com allowed). Use `fill` + a sized, `relative` parent for
  contained media, or width/height.
- `Button` is the pill: `variant` primary|secondary|white|outline, `size` default|sm|lg|circle,
  `block`, `asChild` (to render the pill onto a `<Link>`). It's `inline-flex justify-between` (label
  left, icon right) — pass `<Text/>` + `<Icon/>` as children.
- `Price` renders the dual `лв / €` (cents in, sale styling automatic).
- `Heading` is the responsive ladder (level 1–6); `as` overrides the tag (e.g. `as="h1" level={2}`).

## Token reference (all EXACT theme values; in @theme → utilities)

| Utility | Value |
|---|---|
| `text-h1`..`text-h6` | 80 / 52 / 40 / 22 / 18 / 16 px (desktop) + per-level line-height & tracking |
| `text-h1-m`..`text-h6-m` | 56 / 40 / 26 / 19 / 18 / 14 px (mobile) — used by Heading at `md:` |
| `text-base/sm/xs/2xs` | 16 / 15 / 14 / 13 px · `text-eyebrow` 18px |
| `bg-primary` / `bg-primary-dark` | #ff1b5c / #e70042 (hover reveal) |
| `bg-secondary` | #3a3a3a |
| `text-ink` | #232323 · `text-primary` #ff1b5c · `text-sale` #ea0606 |
| `bg-surface` / `bg-page` | #ffffff / #f4f4f4 |
| `border-border` | #ebebeb |
| `text-sale-label` / `border-sale-label` | #00a500 (green) · `bg-soldout-label` #8a9297 |
| `bg-announce` | #fd5b2a · `bg-footer` #000 · `text-footer-text` #ebebeb · `text-footer-link` #cccccc |
| `rounded-btn/card/media/input` | 50 / 20 / 10 / 2 px |
| `max-w-page` | 1660px (`.page-width`) — use `<Container>` |
| `font-sans` / `font-nav` | Instrument Sans / Archivo Narrow |

Probed exact bits already baked into primitives: card padding 20 / radius 20, card **title 22px
weight 400**, button **16px / 700**, padding `13px 20px 13px 23px`, radius 50px, dual price.

## Exemplars — copy these patterns

- **`src/components/product/ProductCard.tsx`** — the shared card from primitives (Card + Image fill +
  ProductLabel + Price + two Buttons). Self-contained, fills its grid cell (`h-full`).
- **`src/components/templates/CollectionTemplate.tsx`** — page surface: `Container`, inline pink
  `Breadcrumbs` (Text/Link), `Heading as="h1" level={2}`, a responsive
  `grid grid-cols-1 md:grid-cols-3 gap-x-[11px] gap-y-[30px]` of `<ProductCard>`, `Rte` description.

## Your job per surface

Replace the surface's theme-class markup with primitives, preserving structure/spacing faithfully
(probe live for exact values where unsure), keep the export/props, add `'use client'` only if
interactive. Then sanity-check by probing your migrated route vs live.

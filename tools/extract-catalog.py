#!/usr/bin/env python3
"""Migrate the real EasyTech3D catalog off Shopify → src/data/catalog.generated.ts.

Sources of truth:
  - products_export_1.csv   (Shopify admin product export): titles, descriptions, variants,
                             prices, options, images, tags, vendor, status
  - inventory_export_1.csv  (Shopify admin inventory export): per-SKU stock at 3 locations
                             → real `available` flag (joined by SKU)
  - live collections JSON   (public storefront, no auth): the 21 collections + their membership
                             and manual ordering

Only ACTIVE products are migrated (matches the 149 live on the storefront). Money is stored as
INTEGER CENTS (Shopify convention). Images keep their Shopify CDN URLs (self-hosting deferred).
Collections store product *handles* only; src/data/catalog.ts resolves them to products at load.

Regenerate:
    python3 tools/extract-catalog.py [--csv-dir "/path/to/easytech3d csv's"]
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.request
from collections import OrderedDict
from urllib.parse import quote

STORE = "https://www.easytech3d.com"
HERE = os.path.dirname(os.path.abspath(__file__))
# Shopify export CSVs live in the repo (gitignored — see .gitignore). Resolve relative to this
# script so regeneration works regardless of the current working directory.
DEFAULT_CSV_DIR = os.path.normpath(os.path.join(HERE, "..", "easytech3d csv's"))
OUT = os.path.normpath(os.path.join(HERE, "..", "src", "data", "catalog.generated.ts"))

# Inventory stock columns (one per fulfilment location in the export).
LOCATION_COLS = ["zh,k. Lulin 7, Sofia, Bulgaria", "Speedy", "Ekont"]
# The store's product imagery is square 1000x1000; the product CSV carries no dimensions.
IMG_W = IMG_H = 1000
# Used only for the rare active product with zero images.
PLACEHOLDER_SRC = "https://cdn.shopify.com/s/files/1/0726/9413/7129/files/baner_2.webp"


def cents(raw: str | None) -> int | None:
    s = (raw or "").strip()
    if not s:
        return None
    return round(float(s) * 100)


def clean_sku(raw: str | None) -> str:
    # Shopify CSV guards numeric SKUs with a leading apostrophe (Excel text marker).
    return (raw or "").strip().lstrip("'")


def image(src: str, alt: str, w: int = IMG_W, h: int = IMG_H) -> dict:
    return {"src": src, "alt": alt or "", "width": w, "height": h, "aspectRatio": round(w / h, 4)}


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def load_inventory(csv_dir: str) -> dict[str, bool]:
    """SKU → in-stock? (sum of the location columns > 0)."""
    path = os.path.join(csv_dir, "inventory_export_1.csv")
    avail: dict[str, bool] = {}
    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            sku = clean_sku(row.get("SKU"))
            if not sku:
                continue
            total = 0
            for col in LOCATION_COLS:
                try:
                    total += int((row.get(col) or "").strip())
                except ValueError:
                    pass  # "not stocked" / blank → 0
            avail[sku] = total > 0
    return avail


def load_products(csv_dir: str, avail: dict[str, bool]) -> list[dict]:
    path = os.path.join(csv_dir, "products_export_1.csv")
    with open(path, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    groups: "OrderedDict[str, list[dict]]" = OrderedDict()
    for r in rows:
        groups.setdefault(r["Handle"], []).append(r)

    products: list[dict] = []
    for handle, rs in groups.items():
        master = rs[0]
        if (master.get("Status") or "").strip() != "active":
            continue

        opt_names = [(master.get(f"Option{i} Name") or "").strip() for i in (1, 2, 3)]

        # Images: every row may carry one; order by Image Position, dedupe by URL.
        seen_img: "OrderedDict[str, tuple[int, str]]" = OrderedDict()
        for r in rs:
            src = (r.get("Image Src") or "").strip()
            if not src or src in seen_img:
                continue
            try:
                pos = int((r.get("Image Position") or "").strip())
            except ValueError:
                pos = 9999
            seen_img[src] = (pos, (r.get("Image Alt Text") or "").strip())
        media = [
            image(src, alt)
            for src, (_pos, alt) in sorted(seen_img.items(), key=lambda kv: kv[1][0])
        ]
        if not media:
            media = [image(PLACEHOLDER_SRC, master.get("Title") or handle)]

        # Variants: every row that carries a Variant Price.
        variants: list[dict] = []
        opt_values: list["OrderedDict[str, bool]"] = [OrderedDict(), OrderedDict(), OrderedDict()]
        n_priced = sum(1 for r in rs if (r.get("Variant Price") or "").strip())
        for r in rs:
            if not (r.get("Variant Price") or "").strip():
                continue
            vals = [(r.get(f"Option{i} Value") or "").strip() for i in (1, 2, 3)]
            vopts: list[str] = []
            for i, v in enumerate(vals):
                name = opt_names[i]
                if not v or not name:
                    continue
                # Drop Shopify's synthetic single-variant option ("Title" / "Default Title").
                if name.lower() == "title" and v == "Default Title":
                    continue
                opt_values[i][v] = True
                vopts.append(v)

            sku = clean_sku(r.get("Variant SKU"))
            # A handful of products carry no SKU in the Shopify export. Synthesize a stable one from
            # the handle (suffixed per variant when multi-variant) so every variant has an identifier
            # — used as the variant id, in Product JSON-LD, etc. Real SKUs are never overwritten.
            if not sku:
                sku = handle.upper() if n_priced == 1 else f"{handle.upper()}-{len(variants) + 1}"
            vimg = (r.get("Variant Image") or "").strip() or (r.get("Image Src") or "").strip()
            price = cents(r.get("Variant Price")) or 0
            variant = {
                "id": sku,
                "title": " / ".join(vopts) if vopts else "Default Title",
                "available": avail.get(sku, price > 0),
                "price": price,
                "compareAtPrice": cents(r.get("Variant Compare At Price")),
                "options": vopts,
                "sku": sku,
                "featuredImage": image(vimg, master.get("Title") or handle) if vimg else media[0],
            }
            variants.append(variant)

        if not variants:
            print(f"  ! skipping {handle}: active but no priced variants", file=sys.stderr)
            continue

        options = []
        for i in range(3):
            name = opt_names[i]
            if name and name.lower() != "title" and opt_values[i]:
                options.append({"name": name, "position": i + 1, "values": list(opt_values[i])})

        chosen = next((v for v in variants if v["available"]), variants[0])
        prices = [v["price"] for v in variants]
        tags = [t.strip() for t in (master.get("Tags") or "").split(",") if t.strip()]

        prod = {
            "id": handle,
            "handle": handle,
            "title": (master.get("Title") or "").strip(),
            "vendor": (master.get("Vendor") or "").strip(),
            "url": f"/products/{handle}",
            "descriptionHtml": master.get("Body (HTML)") or "",
            "featuredImage": media[0],
            "media": media,
            "options": options,
            "variants": variants,
            "price": chosen["price"],
            "priceMin": min(prices),
            "priceMax": max(prices),
            "compareAtPrice": chosen["compareAtPrice"],
            "available": any(v["available"] for v in variants),
            "tags": tags,
        }
        # Hand-written SEO copy (the store optimised these; surface them when present).
        seo_title = (master.get("SEO Title") or "").strip()
        seo_desc = (master.get("SEO Description") or "").strip()
        if seo_title:
            prod["seoTitle"] = seo_title
        if seo_desc:
            prod["seoDescription"] = seo_desc
        products.append(prod)
    return products


def load_collections(active_handles: set[str]) -> list[dict]:
    cols = fetch_json(f"{STORE}/collections.json?limit=250")["collections"]
    seeds: list[dict] = []
    for i, c in enumerate(cols, 1):
        handle = c["handle"]
        member_handles: list[str] = []
        seen: set[str] = set()
        page = 1
        while True:
            url = f"{STORE}/collections/{quote(handle)}/products.json?limit=250&page={page}"
            ps = fetch_json(url).get("products", [])
            if not ps:
                break
            for p in ps:
                h = p["handle"]
                if h in active_handles and h not in seen:
                    seen.add(h)
                    member_handles.append(h)
            if len(ps) < 250:
                break
            page += 1

        ci = c.get("image")
        img_obj = None
        if ci and ci.get("src"):
            w = ci.get("width") or IMG_W
            h = ci.get("height") or IMG_H
            img_obj = image(ci["src"], c["title"], w, h)

        seeds.append(
            {
                "id": f"col-{i}",
                "handle": handle,
                "title": c["title"],
                "descriptionHtml": c.get("description") or "",
                "image": img_obj,  # often null → catalog.ts falls back to first product's image
                "productHandles": member_handles,
            }
        )
        print(f"  · {handle}: {len(member_handles)} products", file=sys.stderr)
    return seeds


def ts(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=2)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv-dir", default=DEFAULT_CSV_DIR, help="dir holding the Shopify export CSVs")
    args = ap.parse_args()

    if not os.path.isdir(args.csv_dir):
        print(f"CSV dir not found: {args.csv_dir}", file=sys.stderr)
        return 1

    print("Loading inventory…", file=sys.stderr)
    avail = load_inventory(args.csv_dir)
    print(f"  {len(avail)} SKUs", file=sys.stderr)

    print("Loading products (active only)…", file=sys.stderr)
    products = load_products(args.csv_dir, avail)
    print(f"  {len(products)} products", file=sys.stderr)

    active_handles = {p["handle"] for p in products}
    print("Fetching collections + membership from live store…", file=sys.stderr)
    seeds = load_collections(active_handles)
    print(f"  {len(seeds)} collections", file=sys.stderr)

    header = (
        "// AUTO-GENERATED by tools/extract-catalog.py — DO NOT EDIT BY HAND.\n"
        "// Real EasyTech3D catalog migrated off Shopify: products + inventory from the admin CSV\n"
        "// exports, collections + membership from the live storefront JSON. Money in integer cents;\n"
        "// images keep their Shopify CDN URLs (self-hosting deferred).\n"
        "// Regenerate: python3 tools/extract-catalog.py\n"
        "import type { ShopImage, ShopProduct } from '@/lib/shopify/types';\n\n"
        "export interface CollectionSeed {\n"
        "  id: string;\n"
        "  handle: string;\n"
        "  title: string;\n"
        "  descriptionHtml: string;\n"
        "  image: ShopImage | null;\n"
        "  productHandles: string[];\n"
        "}\n"
    )
    body = (
        f"\nexport const products: ShopProduct[] = {ts(products)};\n"
        f"\nexport const collectionSeeds: CollectionSeed[] = {ts(seeds)};\n"
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header + body)
    print(f"Wrote {OUT}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

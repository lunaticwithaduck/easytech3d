// Translation of sections/product-template.liquid (the PDP).
//
// Block order from templates/product.json:
//   sku_block · product_title · rating · product_vendor · product_price ·
//   product_options_block · quantity_block · product_buttons · back_in_stock ·
//   product_description (desc_display: "full_width").
//
// media_size is "medium" → media column `medium-up--one-half`, description column
// `medium-up--one-half` (Liquid `case section.settings.media_size`). show_breadcrumbs is true.
//
// The two columns:
//   • <ProductMedia/>  — the `.product-single__media-group` gallery (client; thumbnail switching)
//   • <ProductForm/>   — the `.product-single__meta` buy box (client; variants / qty / buttons)
// The description block uses desc_display "full_width", so it renders BELOW the grid as
// `.full_product-single__description` (Liquid: show_product_desc_full_width loop at end of section).
//
// Structure/classes verified against the rendered ground truth:
//   tools/output/reference/mirror/products/elegoo-pla-red-filament/index.html (lines 1682-2178)

import type { ReactElement } from 'react';
import { Breadcrumbs } from '@/components/snippets/Breadcrumbs';
import { Rte } from '@/components/snippets/Rte';
import { ProductMedia } from '@/components/product/ProductMedia';
import { ProductForm } from '@/components/product/ProductForm';
import type { ShopProduct } from '@/lib/shopify/types';

export function ProductTemplate({ product }: { product: ShopProduct }): ReactElement {
  return (
    <div className="page-width-small" data-section-type="product">
      {/* {% render 'breadcrumbs' product:product %} → Home + current product */}
      <Breadcrumbs
        items={[
          { title: 'Начало', url: '/' },
          { title: product.title, url: product.url },
        ]}
      />

      <div className="grid product-single">
        {/* ── media column (grid__item product-single__media-group medium-up--one-half) ── */}
        <ProductMedia media={product.media} title={product.title} />

        {/* ── info column (grid__item medium-up--one-half) ── */}
        <div className="grid__item medium-up--one-half">
          <ProductForm product={product} />
        </div>
      </div>

      {/* ── product_description (desc_display: full_width) ──────────────────────── */}
      <Rte
        html={product.descriptionHtml}
        className="product-single__description main-product-description-main full_product-single__description"
      />
    </div>
  );
}

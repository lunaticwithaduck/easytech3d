// Product detail page (PDP) — migrated to design-system primitives (no theme classes).
//
// Layout faithful to the live `.page-width-small` / `.product-single` surface:
//   • pink Breadcrumbs (Начало › product)  — same inline pattern as CollectionTemplate
//   • two-column grid on desktop / stacked on mobile:
//       left  = <ProductMedia/>  (gallery: square contained main image + thumbnail row)
//       right = <ProductForm/>   (buy-box: vendor · title · price · qty · buttons)
//   • full-width product description below the grid (Rte)
//
// Contract unchanged: ProductTemplate({ product }). The two children own their own client logic.

import type { ReactElement } from 'react';
import { Container, Link, Text } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';
import { ProductMedia } from '@/components/product/ProductMedia';
import { ProductForm } from '@/components/product/ProductForm';
import type { ShopProduct } from '@/lib/shopify/types';

// breadcrumbs_color #ff1b5c → pink crumbs (same as CollectionTemplate).
function Breadcrumbs({ items }: { items: { title: string; url?: string }[] }) {
  return (
    <nav aria-label="breadcrumbs" className="mb-5 flex flex-wrap items-center gap-2">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.title}-${i}`} className="flex items-center gap-2">
            {item.url && !last ? (
              <Link href={item.url} className="text-sm text-primary hover:underline">
                {item.title}
              </Link>
            ) : (
              <Text as="span" size="sm" color="primary" value={item.title} />
            )}
            {!last && <Text as="span" size="sm" color="primary" value="›" />}
          </span>
        );
      })}
    </nav>
  );
}

export function ProductTemplate({ product }: { product: ShopProduct }): ReactElement {
  return (
    <Container as="div" className="pb-14 pt-8 md:pt-12" data-section-type="product">
      <Breadcrumbs
        items={[
          { title: 'Начало', url: '/' },
          { title: product.title, url: product.url },
        ]}
      />

      <div className="grid grid-cols-1 gap-x-[22px] gap-y-8 md:grid-cols-2 md:items-start">
        {/* ── media column ── */}
        <ProductMedia media={product.media} title={product.title} />

        {/* ── buy-box column ── */}
        <ProductForm product={product} />
      </div>

      {/* ── full-width description ── */}
      <Rte html={product.descriptionHtml} className="mt-[30px] mb-[35px] max-w-none text-ink" />
    </Container>
  );
}

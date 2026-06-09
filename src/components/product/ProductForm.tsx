'use client';

// PDP buy-box — migrated to design-system primitives (no theme classes, no theme `.btn`/`.qty`/…).
// Single-variant product (per the page contract): no option selectors / swatches — just vendor,
// title, dual price, a quantity stepper, and the two action buttons. The variant-resolution and
// quantity state are preserved; only the markup/styling changed. No backend, so the buttons are
// type="button". Exact metrics probed on the live PDP (easytech3d.com/products/elegoo-pla-red-filament):
//   title 32px/700, ls 1px · vendor 14px/400 · price 20px/400 (sale red #ea0606) · policy 15px ·
//   qty stepper 150×50, bg #f4f4f4, radius 50px, pad 10px; minus/plus 30×30 round; input 70px/700 ·
//   add-to-cart pink pill, buy-now #f4f4f4 bg / pink text pill (both 13/20/13/23 padding, radius 50).

import { useState } from 'react';
import { Button, Heading, Icon, Link, Text, cn } from '@/design-system';
import { dualPrice, money } from '@/lib/shopify/money';
import type { ShopProduct, ShopVariant } from '@/lib/shopify/types';

export function ProductForm({ product }: { product: ShopProduct }) {
  const currentVariant: ShopVariant | undefined =
    product.variants.find((v) => v.available) ?? product.variants[0];

  const [quantity, setQuantity] = useState(1);

  const sku = currentVariant?.sku;
  const available = currentVariant?.available ?? product.available;

  const price = currentVariant?.price ?? product.price;
  const compareAtPrice = currentVariant?.compareAtPrice ?? product.compareAtPrice;
  const onSale = compareAtPrice != null && compareAtPrice > price;

  return (
    <div>
      <form
        method="post"
        action="/cart/add"
        acceptCharset="UTF-8"
        encType="multipart/form-data"
        noValidate
        data-product-form=""
      >
        <input type="hidden" name="form_type" value="product" />
        <input type="hidden" name="utf8" value="✓" />

        {/* ── SKU ───────────────────────────────────────────────────────────── */}
        {sku && (
          <Text as="p" size="xs" color="muted" className="mb-1">
            SKU: <span>{sku}</span>
          </Text>
        )}

        {/* ── vendor ────────────────────────────────────────────────────────── */}
        <div className="mb-2">
          <span className="sr-only">Доставчик</span>
          <Link
            href={`/collections/vendors?q=${product.vendor}`}
            title={product.vendor}
            className="text-xs text-ink hover:text-primary"
          >
            {product.vendor}
          </Link>
        </div>

        {/* ── title (probed 32px / 700 / ls 1px) ────────────────────────────── */}
        <Heading
          as="h1"
          level={4}
          className="mb-2 text-[32px] leading-[32px] tracking-[1px] md:text-[32px]"
        >
          {product.title}
        </Heading>

        {/* ── price (dual лв/€; sale styling — probed 20px / 400) ───────────── */}
        <div className="flex flex-wrap items-baseline gap-[10px]" data-product-policies-anchor>
          <Text
            as="span"
            color={onSale ? 'sale' : 'ink'}
            className="text-[20px] leading-[30px]"
            value={dualPrice(price)}
          />
          {onSale && compareAtPrice != null && (
            <Text as="s" color="muted" className="text-[20px] leading-[30px]" value={money(compareAtPrice)} />
          )}
        </div>

        <Text as="div" size="sm" className="mb-4 mt-[6px]" value="ДДС Включено." />

        {/* ── quantity ──────────────────────────────────────────────────────── */}
        <div className="mb-[10px]">
          <div className="flex items-center">
            <label className="mb-[5px] block font-bold" htmlFor="Quantity-main">
              Количество:
            </label>
            <div className="ml-5 flex h-[50px] w-[150px] items-center justify-between rounded-btn bg-page p-[10px]">
              <button
                type="button"
                aria-label="Намали количеството"
                className="flex size-[30px] items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Icon name="minus" className="size-[10px]" />
              </button>
              <input
                type="text"
                id="Quantity-main"
                name="quantity"
                value={quantity}
                min={1}
                pattern="[0-9]*"
                inputMode="numeric"
                className="w-[70px] border-0 bg-transparent text-center font-bold text-ink outline-none"
                data-quantity-input=""
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setQuantity(Number.isNaN(n) ? 1 : Math.max(1, n));
                }}
              />
              <button
                type="button"
                aria-label="Увеличи количеството"
                className="flex size-[30px] items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Icon name="plus" className="size-[10px]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── action buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[10px]">
          <Button
            variant="primary"
            block
            name="add"
            aria-label="Добави в количката"
            disabled={!available}
            data-add-to-cart=""
          >
            <Text as="span" weight="bold" color="white" value={available ? 'Добави в количката' : 'Изпродадено'} />
            <Icon name="cart" className="size-5 shrink-0" />
          </Button>

          {/* Live "Buy it now" accelerated checkout — #f4f4f4 pill with pink text (no backend). */}
          <Button
            variant="primary"
            block
            className="bg-page text-primary hover:bg-[#e6e6e6]"
            aria-label="Купете сега"
          >
            <Text as="span" weight="bold" color="primary" value="Купете сега" />
            <Icon name="tail-right" className="size-4 shrink-0" />
          </Button>
        </div>

        {/* ── back in stock ─────────────────────────────────────────────────── */}
        {!available && (
          <div className="mt-5" data-id={`ContactForm_${product.id}`}>
            <label className="mb-2 block" htmlFor={`back_in_stock_custom_formInput-${product.id}`}>
              <Text as="span" size="h5" weight="bold" value="Извести ме като се презареди" />
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                id={`back_in_stock_custom_formInput-${product.id}`}
                className={cn(
                  'w-full rounded-input border border-border bg-surface px-4 py-3 text-base text-ink',
                  'outline-none transition-colors placeholder:text-ink/40 focus:border-ink',
                )}
                defaultValue=""
                placeholder="Имейл"
                autoCorrect="off"
                autoCapitalize="off"
              />
              <Button variant="primary" size="circle" aria-label="Изпрати">
                <Icon name="check" className="size-5" />
              </Button>
            </div>
          </div>
        )}

        <input type="hidden" name="product-id" value={product.id} />
        <input type="hidden" name="section-id" value="main" />
      </form>
    </div>
  );
}

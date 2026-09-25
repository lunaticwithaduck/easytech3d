'use client';

// PDP buy-box — design-system primitives. Now backed by the server cart: a variant selector (for
// multi-option products), quantity stepper, and a real add-to-cart (+ buy-now → cart) wired to the
// cart store. Single-variant products show no selector.

import { useState } from 'react';
import { requestBackInStock } from '@/actions/forms';
import { cartActions, useCartPending } from '@/components/layout/cart-store';
import { routes } from '@/config/routes';
import { Button, cn, Heading, Icon, Link, Text } from '@/design-system';
import { useRouter } from '@/i18n/navigation';
import { money } from '@/lib/shopify/money';
import type { ShopProduct, ShopVariant } from '@/lib/shopify/types';

export function ProductForm({ product }: { product: ShopProduct }) {
  const pending = useCartPending();
  const router = useRouter();

  const firstVariant = product.variants.find((v) => v.available) ?? product.variants[0];
  const [selected, setSelected] = useState<string[]>(firstVariant?.options ?? []);
  const [quantity, setQuantity] = useState(1);
  const [bisEmail, setBisEmail] = useState('');
  const [bisStatus, setBisStatus] = useState<'idle' | 'sending' | 'done'>('idle');

  const currentVariant: ShopVariant | undefined =
    product.options.length > 0
      ? (product.variants.find(
          (v) =>
            v.options.length === selected.length && v.options.every((o, i) => o === selected[i]),
        ) ?? firstVariant)
      : firstVariant;

  const sku = currentVariant?.sku;
  const available = currentVariant?.available ?? product.available;
  const price = currentVariant?.price ?? product.price;
  const compareAtPrice = currentVariant?.compareAtPrice ?? product.compareAtPrice;
  const onSale = compareAtPrice != null && compareAtPrice > price;

  const setOption = (i: number, value: string) =>
    setSelected((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });

  const add = () => {
    if (currentVariant && available) void cartActions.add(currentVariant.id, quantity);
  };
  const buyNow = async () => {
    if (currentVariant && available) {
      await cartActions.add(currentVariant.id, quantity);
      router.push(routes.cart);
    }
  };
  const notifyBackInStock = async () => {
    if (!bisEmail.trim()) return;
    setBisStatus('sending');
    const res = await requestBackInStock(bisEmail.trim(), product.handle, currentVariant?.id);
    setBisStatus(res.ok ? 'done' : 'idle');
  };

  return (
    <div>
      <div data-product-form="">
        {sku && (
          <Text as="p" size="xs" color="muted" className="mb-1">
            SKU: <span>{sku}</span>
          </Text>
        )}

        <Heading
          as="h1"
          level={4}
          className="mb-2 text-[32px] leading-[32px] tracking-[1px] md:text-[32px]"
        >
          {product.title}
        </Heading>

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

        <div className="flex flex-wrap items-baseline gap-[10px]" data-product-policies-anchor>
          <Text
            as="span"
            color={onSale ? 'sale' : 'ink'}
            className="text-[20px] leading-[30px]"
            value={money(price)}
          />
          {onSale && compareAtPrice != null && (
            <Text
              as="s"
              color="muted"
              className="text-[20px] leading-[30px]"
              value={money(compareAtPrice)}
            />
          )}
          {onSale && (
            <Text
              as="span"
              weight="bold"
              className="self-center rounded-input border border-sale bg-sale px-2 py-[3px] text-[10px] uppercase leading-[10px] text-page"
              value="Промоция"
            />
          )}
        </div>

        <Text as="div" size="sm" className="mb-4 mt-[6px]" value="ДДС Включено." />

        {/* ── variant selector (only when the product has real options) ───────── */}
        {product.options.map((option, i) => (
          <div key={option.name} className="mb-4">
            <Text as="span" size="sm" weight="bold" className="mb-2 block">
              {option.name}
            </Text>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSel = selected[i] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOption(i, value)}
                    className={cn(
                      'rounded-btn border px-4 py-2 text-sm font-medium transition-colors',
                      isSel
                        ? 'border-primary bg-primary text-surface'
                        : 'border-border bg-surface text-ink hover:border-ink',
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── quantity ──────────────────────────────────────────────────────── */}
        <div className="mb-[10px] flex h-[70px] w-full items-center justify-between rounded-btn bg-surface px-[30px] py-[10px]">
          <label className="font-bold text-ink" htmlFor="Quantity-main">
            Количество:
          </label>
          <div className="flex h-[50px] w-[150px] items-center justify-between rounded-btn bg-page p-[10px]">
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
                const n = Number.parseInt(e.target.value, 10);
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

        {/* ── action buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-[10px] sm:flex-row">
          <Button
            variant="primary"
            block
            type="button"
            aria-label="Добави в количката"
            disabled={!available || pending}
            data-add-to-cart=""
            className="flex-1"
            onClick={add}
          >
            <Text
              as="span"
              weight="bold"
              color="white"
              value={available ? 'Добави в количката' : 'Изпродадено'}
            />
            <Icon name="cart" className="size-5 shrink-0" />
          </Button>

          <Button
            variant="primary"
            block
            type="button"
            className="flex-1 border border-primary bg-page text-primary hover:bg-[#e6e6e6]"
            aria-label="Купете сега"
            disabled={!available || pending}
            onClick={buyNow}
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
            {bisStatus === 'done' ? (
              <Text
                as="p"
                size="sm"
                weight="bold"
                className="text-success"
                value="Ще Ви известим на този имейл, когато се презареди."
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  id={`back_in_stock_custom_formInput-${product.id}`}
                  className={cn(
                    'w-full rounded-input border border-border bg-surface px-4 py-3 text-base text-ink',
                    'outline-none transition-colors placeholder:text-ink/40 focus:border-ink',
                  )}
                  value={bisEmail}
                  onChange={(e) => setBisEmail(e.target.value)}
                  placeholder="Имейл"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <Button
                  variant="primary"
                  size="circle"
                  type="button"
                  aria-label="Изпрати"
                  disabled={bisStatus === 'sending' || !bisEmail.trim()}
                  onClick={notifyBackInStock}
                >
                  <Icon name="check" className="size-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

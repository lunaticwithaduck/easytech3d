'use client';

import { useEffect, useState } from 'react';
import { cartActions, useCartPending } from '@/components/layout/cart-store';
import { Button, cn, Heading, Icon, Image, Link, Text } from '@/design-system';
import { useRouter } from '@/i18n/navigation';
import { imageUrl } from '@/lib/shopify/image';
import { money } from '@/lib/shopify/money';
import type { ShopProduct, ShopVariant } from '@/lib/shopify/types';

// Quick-view modal — opens from a product card's "Бърз преглед" button without leaving the grid.
// Mirrors the codebase overlay pattern (CartDrawer): plain fixed overlay + Escape + body lock.
// Reuses the PDP buy-box logic (variant match + qty + add/buy-now wired to the cart store).
export function QuickView({ product }: { product: ShopProduct }) {
  const [open, setOpen] = useState(false);
  const pending = useCartPending();
  const router = useRouter();

  const firstVariant = product.variants.find((v) => v.available) ?? product.variants[0];
  const [selected, setSelected] = useState<string[]>(firstVariant?.options ?? []);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const currentVariant: ShopVariant | undefined =
    product.options.length > 0
      ? (product.variants.find(
          (v) =>
            v.options.length === selected.length && v.options.every((o, i) => o === selected[i]),
        ) ?? firstVariant)
      : firstVariant;

  const available = currentVariant?.available ?? product.available;
  const price = currentVariant?.price ?? product.price;
  const compareAtPrice = currentVariant?.compareAtPrice ?? product.compareAtPrice;
  const onSale = compareAtPrice != null && compareAtPrice > price;
  const media = product.media.length > 0 ? product.media : [product.featuredImage];
  const hero = media[activeImage] ?? media[0];

  const setOption = (i: number, value: string) =>
    setSelected((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });

  const add = () => {
    if (currentVariant && available) {
      void cartActions.add(currentVariant.id, quantity);
      setOpen(false); // cartActions.add opens the drawer — close the modal so it's visible
    }
  };
  const buyNow = async () => {
    if (currentVariant && available) {
      await cartActions.add(currentVariant.id, quantity);
      setOpen(false);
      router.push(product.url);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        block
        type="button"
        aria-label="Бърз преглед"
        onClick={() => setOpen(true)}
      >
        <Text as="span" weight="bold" color="white" value="Бърз преглед" />
        <Icon name="tail-right" className="size-4 shrink-0" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={product.title}
            className="relative z-10 flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-card bg-surface shadow-xl md:flex-row"
          >
            <Button
              variant="outline"
              size="circle"
              aria-label="Затвори"
              className="absolute right-3 top-3 z-20"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" className="size-[18px]" />
            </Button>

            {/* Media */}
            <div className="flex shrink-0 flex-col gap-3 bg-page p-6 md:w-[42%]">
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-surface">
                <Image
                  src={imageUrl(hero.src, 700)}
                  alt={hero.alt || product.title}
                  fill
                  sizes="(min-width: 768px) 360px, 90vw"
                  className="object-contain"
                />
              </div>
              {media.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {media.slice(0, 5).map((m, i) => (
                    <button
                      key={m.src}
                      type="button"
                      aria-label={`Изображение ${i + 1}`}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        'relative size-14 overflow-hidden rounded-md border bg-surface transition-colors',
                        i === activeImage ? 'border-primary' : 'border-border hover:border-ink',
                      )}
                    >
                      <Image
                        src={imageUrl(m.src, 120)}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
              {product.vendor && (
                <Text as="span" size="xs" color="muted" className="mb-1" value={product.vendor} />
              )}
              <Heading as="h2" level={4} className="mb-2">
                {product.title}
              </Heading>

              <div className="mb-1 flex flex-wrap items-baseline gap-[10px]">
                <Text
                  as="span"
                  weight="bold"
                  color={onSale ? 'sale' : 'ink'}
                  className="text-[22px] leading-[30px]"
                  value={money(price)}
                />
                {onSale && compareAtPrice != null && (
                  <Text
                    as="s"
                    color="muted"
                    className="text-[18px] leading-[30px]"
                    value={money(compareAtPrice)}
                  />
                )}
              </div>
              <Text as="span" size="sm" color="muted" className="mb-4" value="ДДС включено." />

              {/* variant selector */}
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

              {/* quantity */}
              <div className="mb-4 flex items-center gap-3">
                <Text as="span" size="sm" weight="bold" value="Количество:" />
                <div className="flex items-center gap-1 rounded-full bg-page p-1">
                  <button
                    type="button"
                    aria-label="Намали количеството"
                    className="flex size-7 items-center justify-center rounded-full text-ink hover:bg-ink/10"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Icon name="minus" className="size-[10px]" />
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Увеличи количеството"
                    className="flex size-7 items-center justify-center rounded-full text-ink hover:bg-ink/10"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Icon name="plus" className="size-[10px]" />
                  </button>
                </div>
              </div>

              {/* actions */}
              <div className="mt-auto flex flex-col gap-[10px]">
                <Button
                  variant="primary"
                  block
                  type="button"
                  aria-label="Добави в количката"
                  disabled={!available || pending}
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
                {available && (
                  <Button
                    variant="primary"
                    block
                    type="button"
                    className="border border-primary bg-page text-primary hover:bg-[#e6e6e6]"
                    aria-label="Купете сега"
                    disabled={pending}
                    onClick={buyNow}
                  >
                    <Text as="span" weight="bold" color="primary" value="Купете сега" />
                    <Icon name="tail-right" className="size-4 shrink-0" />
                  </Button>
                )}
                <Link
                  href={product.url}
                  className="text-center text-sm text-ink/60 underline-offset-2 hover:text-primary hover:underline"
                >
                  <Text as="span" size="sm" value="Виж пълната страница →" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

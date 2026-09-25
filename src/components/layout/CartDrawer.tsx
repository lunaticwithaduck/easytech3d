'use client';

import { useEffect } from 'react';
import { routes } from '@/config/routes';
import { Button, cn, Heading, Icon, Image, Link, Text } from '@/design-system';
import { money } from '@/lib/shopify/money';
import { cartActions, cartDrawer, useCart, useCartDrawerOpen, useCartPending } from './cart-store';

// Off-canvas cart drawer — backed by the server cart (cart-store). Slides in from the right; shows
// line items with qty steppers + remove, a free-shipping progress bar, the subtotal, and a checkout
// CTA. Closes on the overlay, ×, Escape, or continue-shopping.
export function CartDrawer() {
  const isOpen = useCartDrawerOpen();
  const cart = useCart();
  const pending = useCartPending();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cartDrawer.close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const empty = cart.items.length === 0;
  const progress = Math.min(100, Math.round((cart.subtotal / cart.freeShippingThreshold) * 100));

  return (
    <>
      <div
        aria-hidden
        onClick={() => cartDrawer.close()}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        id="sidebar-cart"
        role="dialog"
        aria-modal="true"
        aria-label="Количка"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col bg-surface shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Heading as="h3" level={4}>
            Количка{cart.itemCount > 0 ? ` (${cart.itemCount})` : ''}
          </Heading>
          <Button
            variant="outline"
            size="circle"
            aria-label="Затвори количката"
            onClick={() => cartDrawer.close()}
          >
            <Icon name="close" className="size-[18px]" />
          </Button>
        </div>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-12">
            <span className="text-ink/30">
              <Icon name="cart" className="size-16" />
            </span>
            <Text
              as="p"
              size="base"
              color="muted"
              className="text-center"
              value="Количката е празна. ;("
            />
            <Button variant="primary" onClick={() => cartDrawer.close()}>
              <Text as="span" weight="bold" color="white" value="Продължете пазаруването" />
            </Button>
          </div>
        ) : (
          <>
            {/* Free-shipping progress */}
            <div className="border-b border-border px-5 py-3">
              {cart.qualifiesForFreeShipping ? (
                <Text
                  as="p"
                  size="sm"
                  weight="bold"
                  className="text-success"
                  value="Имате безплатна доставка! 🎉"
                />
              ) : (
                <Text as="p" size="sm" color="muted">
                  Още {money(cart.freeShippingRemaining)} до безплатна доставка
                </Text>
              )}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-page">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <Link
                    href={item.url}
                    className="relative block size-[72px] shrink-0 overflow-hidden rounded-md bg-page"
                  >
                    {item.image && (
                      <Image
                        src={item.image.src}
                        alt={item.image.alt}
                        fill
                        sizes="72px"
                        className="object-contain"
                      />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={item.url} className="line-clamp-2">
                      <Text as="span" size="sm" weight="medium" className="hover:text-primary">
                        {item.productTitle}
                      </Text>
                    </Link>
                    {item.variantTitle !== 'Default Title' && (
                      <Text as="span" size="xs" color="muted">
                        {item.variantTitle}
                      </Text>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-1 rounded-full bg-page p-1">
                        <button
                          type="button"
                          aria-label="Намали"
                          disabled={pending}
                          onClick={() => cartActions.update(item.id, item.quantity - 1)}
                          className="flex size-6 items-center justify-center rounded-full text-ink hover:bg-ink/10 disabled:opacity-50"
                        >
                          <Icon name="minus" className="size-[10px]" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Увеличи"
                          disabled={pending}
                          onClick={() => cartActions.update(item.id, item.quantity + 1)}
                          className="flex size-6 items-center justify-center rounded-full text-ink hover:bg-ink/10 disabled:opacity-50"
                        >
                          <Icon name="plus" className="size-[10px]" />
                        </button>
                      </div>
                      <Text as="span" size="sm" weight="bold" value={money(item.lineTotal)} />
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Премахни"
                    disabled={pending}
                    onClick={() => cartActions.remove(item.id)}
                    className="self-start text-ink/40 transition-colors hover:text-primary disabled:opacity-50"
                  >
                    <Icon name="close" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-border px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <Text as="span" size="base" weight="bold" value="Междинна сума" />
                <Text as="span" size="base" weight="bold" value={money(cart.subtotal)} />
              </div>
              <Button variant="primary" block asChild>
                <Link href={routes.cart} onClick={() => cartDrawer.close()}>
                  <Text as="span" weight="bold" color="white" value="Към количката" />
                  <Icon name="tail-right" className="size-[18px] shrink-0" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

'use client';

import { cartActions, useCart, useCartPending } from '@/components/layout/cart-store';
import { routes } from '@/config/routes';
import { Button, Heading, Icon, Image, Link, Text } from '@/design-system';
import { money } from '@/lib/shopify/money';

// Full cart page contents — server cart via the store. Line items with qty + remove, a summary with
// subtotal + free-shipping note, and a (Phase 2b) checkout CTA.
export function CartContents() {
  const cart = useCart();
  const pending = useCartPending();

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <Heading as="h1" level={2}>
          Количка
        </Heading>
        <Text as="p" size="base" color="muted">
          Количката е празна. ;(
        </Text>
        <Button variant="primary" asChild>
          <Link href={routes.collections}>
            <Text
              as="span"
              size="base"
              weight="bold"
              color="white"
              value="Продължете пазаруването"
            />
            <Icon name="tail-right" className="size-[18px] shrink-0" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      {/* Items */}
      <div>
        <Heading as="h1" level={2} className="mb-6">
          Количка ({cart.itemCount})
        </Heading>
        <ul className="divide-y divide-border border-y border-border">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-5">
              <Link
                href={item.url}
                className="relative block size-[96px] shrink-0 overflow-hidden rounded-md bg-page"
              >
                {item.image && (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={item.url}>
                  <Text as="span" size="base" weight="medium" className="hover:text-primary">
                    {item.productTitle}
                  </Text>
                </Link>
                {item.variantTitle !== 'Default Title' && (
                  <Text as="span" size="sm" color="muted">
                    {item.variantTitle}
                  </Text>
                )}
                <Text
                  as="span"
                  size="sm"
                  color="muted"
                  className="mt-1"
                  value={money(item.unitPrice)}
                />
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <div className="flex items-center gap-1 rounded-full bg-page p-1">
                    <button
                      type="button"
                      aria-label="Намали"
                      disabled={pending}
                      onClick={() => cartActions.update(item.id, item.quantity - 1)}
                      className="flex size-7 items-center justify-center rounded-full text-ink hover:bg-ink/10 disabled:opacity-50"
                    >
                      <Icon name="minus" className="size-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Увеличи"
                      disabled={pending}
                      onClick={() => cartActions.update(item.id, item.quantity + 1)}
                      className="flex size-7 items-center justify-center rounded-full text-ink hover:bg-ink/10 disabled:opacity-50"
                    >
                      <Icon name="plus" className="size-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => cartActions.remove(item.id)}
                    className="ml-2 text-sm text-ink/50 underline-offset-2 transition-colors hover:text-primary hover:underline disabled:opacity-50"
                  >
                    Премахни
                  </button>
                </div>
              </div>
              <Text
                as="span"
                size="base"
                weight="bold"
                className="shrink-0"
                value={money(item.lineTotal)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-lg border border-border bg-surface p-6">
        <Heading as="h2" level={4} className="mb-4">
          Резюме
        </Heading>
        <div className="mb-2 flex items-center justify-between">
          <Text as="span" size="base" color="muted" value="Междинна сума" />
          <Text as="span" size="base" weight="bold" value={money(cart.subtotal)} />
        </div>
        <Text
          as="p"
          size="sm"
          color="muted"
          className="mb-4"
          value={
            cart.qualifiesForFreeShipping
              ? 'Имате безплатна доставка!'
              : `Още ${money(cart.freeShippingRemaining)} до безплатна доставка`
          }
        />
        <Button variant="primary" block asChild>
          <Link href={routes.checkout}>
            <Text as="span" weight="bold" color="white" value="Към плащане" />
          </Link>
        </Button>
        <Button variant="outline" block asChild className="mt-2">
          <Link href={routes.collections}>
            <Text as="span" weight="medium" value="Продължете пазаруването" />
          </Link>
        </Button>
      </aside>
    </div>
  );
}

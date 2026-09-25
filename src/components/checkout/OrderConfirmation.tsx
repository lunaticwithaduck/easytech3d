import { routes } from '@/config/routes';
import { Button, Container, Heading, Icon, Image, Link, Text } from '@/design-system';
import { money } from '@/lib/shopify/money';
import type { ShopOrder } from '@/lib/shopify/types';

// Order confirmation / thank-you. Server component — receives the order fetched from the backend.
export function OrderConfirmation({ order }: { order: ShopOrder }) {
  const paymentNote =
    order.paymentMethod === 'COD'
      ? 'Плащане при доставка (наложен платеж).'
      : order.paymentStatus === 'PAID'
        ? 'Платено с карта.'
        : 'Очаква плащане с карта.';
  const methodLabel = order.shipping.method === 'ECONT' ? 'Еконт' : 'Спиди';

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <Icon name="check" className="size-7" />
          </span>
          <Heading as="h1" level={2}>
            Благодарим за поръчката!
          </Heading>
          <Text as="p" color="muted">
            Поръчка {order.orderNumber} · потвърждение на {order.email}
          </Text>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={`${item.sku}-${item.variantTitle}`} className="flex items-center gap-3 py-3">
                <span className="relative block size-[56px] shrink-0 overflow-hidden rounded-md bg-page">
                  {item.image && (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <Link href={item.url}>
                    <Text
                      as="span"
                      size="sm"
                      weight="medium"
                      className="line-clamp-1 hover:text-primary"
                    >
                      {item.productTitle}
                    </Text>
                  </Link>
                  {item.variantTitle !== 'Default Title' && (
                    <Text as="span" size="xs" color="muted">
                      {item.variantTitle} · ×{item.quantity}
                    </Text>
                  )}
                </span>
                <Text
                  as="span"
                  size="sm"
                  weight="bold"
                  value={money(item.lineTotal, order.currency)}
                />
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-border pt-4">
            <div className="flex justify-between">
              <Text as="span" size="sm" color="muted" value="Междинна сума" />
              <Text as="span" size="sm" value={money(order.subtotal, order.currency)} />
            </div>
            <div className="flex justify-between">
              <Text as="span" size="sm" color="muted" value="Доставка" />
              <Text
                as="span"
                size="sm"
                value={
                  order.shippingCost === 0 ? 'Безплатно' : money(order.shippingCost, order.currency)
                }
              />
            </div>
            <div className="flex justify-between pt-2">
              <Text as="span" size="base" weight="bold" value="Общо" />
              <Text
                as="span"
                size="base"
                weight="bold"
                value={money(order.total, order.currency)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <Text as="span" size="sm" weight="bold" className="mb-1 block" value="Доставка" />
            {order.shipping.deliveryType === 'OFFICE' ? (
              <Text as="p" size="sm" color="muted">
                {order.firstName} {order.lastName}
                <br />
                Офис на {methodLabel}: {order.shipping.officeName}
                <br />
                {order.shipping.postalCode} {order.shipping.city}
                <br />
                {order.phone}
              </Text>
            ) : (
              <Text as="p" size="sm" color="muted">
                {order.firstName} {order.lastName}
                <br />
                {order.shipping.address1}
                {order.shipping.address2 ? `, ${order.shipping.address2}` : ''}
                <br />
                {order.shipping.postalCode} {order.shipping.city} · {methodLabel}
                <br />
                {order.phone}
              </Text>
            )}
          </div>
          <div>
            <Text as="span" size="sm" weight="bold" className="mb-1 block" value="Плащане" />
            <Text as="p" size="sm" color="muted">
              {paymentNote}
            </Text>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="primary" asChild>
            <Link href={routes.home}>
              <Text as="span" weight="bold" color="white" value="Към началото" />
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}

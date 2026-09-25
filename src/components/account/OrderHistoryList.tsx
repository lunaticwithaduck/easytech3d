import { routes } from '@/config/routes';
import { Icon, Link, Text } from '@/design-system';
import { money } from '@/lib/shopify/money';
import type { ShopOrder } from '@/lib/shopify/types';

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Очаква плащане',
  CONFIRMED: 'Потвърдена',
  CANCELLED: 'Отказана',
  FULFILLED: 'Изпратена',
};

const STATUS_CLASS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-page text-ink/70',
  CONFIRMED: 'bg-sale-label/12 text-sale-label',
  CANCELLED: 'bg-sale/10 text-sale',
  FULFILLED: 'bg-sale-label/12 text-sale-label',
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

// Renders a customer's order history. Plain component — receives orders fetched on the server.
export function OrderHistoryList({ orders }: { orders: ShopOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center">
        <Text as="p" color="muted" value="Все още нямате поръчки." />
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => {
        const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
        return (
          <li key={order.id}>
            <Link
              href={routes.order(order.id)}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:border-ink"
            >
              <span className="min-w-0 flex-1">
                <span className="mb-1 flex flex-wrap items-center gap-2">
                  <Text as="span" weight="bold" value={`Поръчка ${order.orderNumber}`} />
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_CLASS[order.status] ?? 'bg-page text-ink/60'
                    }`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </span>
                <Text as="span" size="sm" color="muted">
                  {formatDate(order.createdAt)} · {itemCount} артикула
                </Text>
              </span>
              <Text as="span" weight="bold" value={money(order.total, order.currency)} />
              <Icon name="chevron-right" className="size-4 shrink-0 text-ink/40" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

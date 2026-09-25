import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentCustomer, getMyOrders } from '@/actions/account';
import { LogoutButton } from '@/components/account/LogoutButton';
import { OrderHistoryList } from '@/components/account/OrderHistoryList';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { Button, Container, Heading, Link, Text } from '@/design-system';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: routes.account.home, title: 'Моят акаунт', noindex: true });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <Text as="span" size="sm" color="muted" value={label} />
      <Text as="span" size="sm" weight="medium" value={value} />
    </div>
  );
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/${locale}${routes.account.login}`);

  const orders = await getMyOrders();
  const recent = orders.slice(0, 3);

  return (
    <>
      <BodyClass name="template-account" />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Heading as="h1" level={2} className="mb-1">
                Здравейте, {customer.firstName}!
              </Heading>
              <Text as="p" color="muted" value={customer.email} />
            </div>
            <LogoutButton />
          </div>

          <div className="mb-10 rounded-lg border border-border bg-surface p-6">
            <Heading as="h2" level={5} className="mb-4">
              Данни за контакт
            </Heading>
            <Row label="Име" value={`${customer.firstName} ${customer.lastName}`} />
            <Row label="Имейл" value={customer.email} />
            <Row label="Телефон" value={customer.phone ?? '—'} />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <Heading as="h2" level={5}>
              Последни поръчки
            </Heading>
            {orders.length > recent.length && (
              <Link href={routes.account.orders} className="text-sm text-primary hover:underline">
                <Text as="span" size="sm" weight="medium" value="Всички поръчки" />
              </Link>
            )}
          </div>
          <OrderHistoryList orders={recent} />

          {orders.length > 0 && (
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link href={routes.account.orders}>
                  <Text as="span" weight="bold" value="Виж всички поръчки" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

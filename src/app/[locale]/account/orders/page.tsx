import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentCustomer, getMyOrders } from '@/actions/account';
import { OrderHistoryList } from '@/components/account/OrderHistoryList';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { Container, Heading, Link, Text } from '@/design-system';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: routes.account.orders,
    title: 'Моите поръчки',
    noindex: true,
  });
}

export default async function AccountOrdersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/${locale}${routes.account.login}`);

  const orders = await getMyOrders();

  return (
    <>
      <BodyClass name="template-account-orders" />
      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2">
            <Link href={routes.account.home} className="text-sm text-ink/60 hover:text-primary">
              <Text as="span" size="sm" value="← Моят акаунт" />
            </Link>
          </div>
          <Heading as="h1" level={2} className="mb-8">
            Моите поръчки
          </Heading>
          <OrderHistoryList orders={orders} />
        </div>
      </Container>
    </>
  );
}

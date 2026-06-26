import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getOrder } from '@/actions/checkout';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  return buildMetadata({ locale, path: routes.order(id), title: 'Поръчка', noindex: true });
}

export default async function OrderPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <>
      <BodyClass name="template-order" />
      <OrderConfirmation order={order} />
    </>
  );
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCart } from '@/actions/cart';
import { getShippingMethods } from '@/actions/checkout';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { Container, Heading } from '@/design-system';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: routes.checkout, title: 'Плащане', noindex: true });
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cart = await getCart();
  if (cart.items.length === 0) redirect(`/${locale}${routes.cart}`);

  const methods = await getShippingMethods(cart.subtotal);

  return (
    <>
      <BodyClass name="template-checkout" />
      <Container className="py-12">
        <Heading as="h1" level={2} className="mb-8">
          Плащане
        </Heading>
        <CheckoutForm cart={cart} methods={methods} />
      </Container>
    </>
  );
}

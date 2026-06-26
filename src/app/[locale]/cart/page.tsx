import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CartTemplate } from '@/components/templates/CartTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { buildMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: routes.cart, title: 'Количка', noindex: true });
}

export default async function CartRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BodyClass name="template-cart" />
      <CartTemplate />
    </>
  );
}

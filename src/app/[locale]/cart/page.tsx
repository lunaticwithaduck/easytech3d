import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BodyClass } from '@/components/util/BodyClass';
import { CartTemplate } from '@/components/templates/CartTemplate';

export const metadata: Metadata = { title: 'Количка – easytech3d' };

type Props = { params: Promise<{ locale: string }> };

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

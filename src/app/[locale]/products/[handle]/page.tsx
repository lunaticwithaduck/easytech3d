import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct } from '@/data/catalog';
import { BodyClass } from '@/components/util/BodyClass';
import { ProductTemplate } from '@/components/templates/ProductTemplate';

type Props = {
  params: Promise<{ locale: string; handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = getProduct(decodeURIComponent(handle));
  if (!product) return {};
  return { title: `${product.title} – easytech3d` };
}

export default async function ProductRoute({ params }: Props) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const product = getProduct(decodeURIComponent(handle));
  if (!product) notFound();

  return (
    <>
      <BodyClass name="template-product" />
      <ProductTemplate product={product} />
    </>
  );
}

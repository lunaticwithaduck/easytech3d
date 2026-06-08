import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProductPage } from '@/features/product/ProductPage';
import { getProduct, getRelatedProducts } from '@/server/catalog/data';

type Props = {
  params: Promise<{ locale: string; handle: string }>;
};

export default async function ProductRoute({ params }: Props) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const product = getProduct(handle);
  if (!product) notFound();

  const related = getRelatedProducts(handle);

  return <ProductPage product={product} related={related} />;
}

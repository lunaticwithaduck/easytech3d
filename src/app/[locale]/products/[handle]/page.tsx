import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ProductTemplate } from '@/components/templates/ProductTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { JsonLd } from '@/components/util/JsonLd';
import { routes } from '@/config/routes';
import { getProduct } from '@/data/catalog';
import { breadcrumbLd, buildMetadata, productLd, stripHtml } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string; handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  const product = await getProduct(decodeURIComponent(handle));
  if (!product) return {};
  return buildMetadata({
    locale,
    path: routes.product(product.handle),
    title: product.seoTitle || product.title,
    description: product.seoDescription || stripHtml(product.descriptionHtml),
    images: [
      {
        url: product.featuredImage.src,
        alt: product.featuredImage.alt || product.title,
        width: product.featuredImage.width,
        height: product.featuredImage.height,
      },
    ],
  });
}

export default async function ProductRoute({ params }: Props) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const product = await getProduct(decodeURIComponent(handle));
  if (!product) notFound();

  return (
    <>
      <BodyClass name="template-product" />
      <JsonLd
        data={[
          productLd(product, locale),
          breadcrumbLd(
            [
              { name: 'Начало', path: routes.home },
              { name: product.title, path: routes.product(product.handle) },
            ],
            locale,
          ),
        ]}
      />
      <ProductTemplate product={product} />
    </>
  );
}

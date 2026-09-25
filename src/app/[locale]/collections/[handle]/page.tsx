import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CollectionTemplate } from '@/components/templates/CollectionTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { JsonLd } from '@/components/util/JsonLd';
import { routes } from '@/config/routes';
import { getCollection, getProductsInCollection } from '@/data/catalog';
import { breadcrumbLd, buildMetadata, collectionLd, stripHtml } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string; handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, handle } = await params;
  const collection = await getCollection(decodeURIComponent(handle));
  if (!collection) return {};
  return buildMetadata({
    locale,
    path: routes.collection(collection.handle),
    title: collection.title,
    description:
      stripHtml(collection.descriptionHtml) ||
      `${collection.title} — качествени консумативи и части за 3D печат на достъпни цени.`,
    images: collection.image
      ? [{ url: collection.image.src, alt: collection.image.alt || collection.title }]
      : undefined,
  });
}

// /collections/[handle] — a single collection listing (templates/collection.json → collection-template).
// Looks up the collection + its products; 404s when the handle is unknown. Server Component.
export default async function CollectionRoute({ params }: Props) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const decodedHandle = decodeURIComponent(handle);
  const collection = await getCollection(decodedHandle);
  if (!collection) notFound();

  const products = await getProductsInCollection(decodedHandle);

  return (
    <>
      <BodyClass name="template-collection" />
      <JsonLd
        data={[
          collectionLd(collection, locale),
          breadcrumbLd(
            [
              { name: 'Начало', path: routes.home },
              { name: 'Колекции', path: routes.collections },
              { name: collection.title, path: routes.collection(collection.handle) },
            ],
            locale,
          ),
        ]}
      />
      <CollectionTemplate collection={collection} products={products} />
    </>
  );
}

import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { BodyClass } from '@/components/util/BodyClass';
import { CollectionTemplate } from '@/components/templates/CollectionTemplate';
import { getCollection, getProductsInCollection } from '@/data/catalog';

type Props = {
  params: Promise<{ locale: string; handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = getCollection(decodeURIComponent(handle));
  if (!collection) return {};
  return { title: `${collection.title} – easytech3d` };
}

// /collections/[handle] — a single collection listing (templates/collection.json → collection-template).
// Looks up the collection + its products; 404s when the handle is unknown. Server Component.
export default async function CollectionRoute({ params }: Props) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const decodedHandle = decodeURIComponent(handle);
  const collection = getCollection(decodedHandle);
  if (!collection) notFound();

  const products = getProductsInCollection(decodedHandle);

  return (
    <>
      <BodyClass name="template-collection" />
      <CollectionTemplate collection={collection} products={products} />
    </>
  );
}

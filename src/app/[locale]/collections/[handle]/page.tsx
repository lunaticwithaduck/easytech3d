import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CollectionPage } from '@/features/collection/CollectionPage';
import { parseSort } from '@/features/collection/config/constants';
import { getCollection, getProductsInCollection } from '@/server/catalog/data';

type Props = {
  params: Promise<{ locale: string; handle: string }>;
  searchParams: Promise<{ sort?: string | string[] }>;
};

// /collections/[handle] — a single collection listing. Loads the collection and its products
// (sorted per `?sort=`), 404s when the handle is unknown. Pure Server Component data-fetch; the
// sort control inside the feature is the only client island.
export default async function CollectionRoute({ params, searchParams }: Props) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const collection = getCollection(handle);
  if (!collection) notFound();

  const sort = parseSort((await searchParams).sort);
  const products = getProductsInCollection(handle, sort);

  return <CollectionPage collection={collection} products={products} sort={sort} />;
}

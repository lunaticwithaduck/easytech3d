import { setRequestLocale } from 'next-intl/server';
import { CollectionsIndex } from '@/features/collections/CollectionsIndex';
import { getCollections } from '@/server/catalog/data';

type Props = {
  params: Promise<{ locale: string }>;
};

// /collections — the collections index. Lists every collection as a card grid. Server Component.
export default async function CollectionsRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const collections = getCollections();

  return <CollectionsIndex collections={collections} />;
}

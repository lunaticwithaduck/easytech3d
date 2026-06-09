import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { BodyClass } from '@/components/util/BodyClass';
import { ListCollectionsTemplate } from '@/components/templates/ListCollectionsTemplate';
import { getCollections } from '@/data/catalog';

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Колекции – easytech3d',
};

// /collections — lists every collection as a card grid.
// Mirrors templates/list-collections.json + sections/list-collections-template.liquid.
// Server Component — no interactivity here.
export default async function CollectionsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const collections = getCollections();

  return (
    <>
      <BodyClass name="template-list-collections" />
      <ListCollectionsTemplate collections={collections} />
    </>
  );
}

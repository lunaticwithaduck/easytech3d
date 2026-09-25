import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ListCollectionsTemplate } from '@/components/templates/ListCollectionsTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { JsonLd } from '@/components/util/JsonLd';
import { routes } from '@/config/routes';
import { getCollections } from '@/data/catalog';
import { breadcrumbLd, buildMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    locale,
    path: routes.collections,
    title: 'Всички категории',
    description:
      'Разгледайте всички категории на EasyTech3D — филаменти, резини, дюзи, легла и части за 3D принтери.',
  });
}

// /collections — lists every collection as a card grid.
// Mirrors templates/list-collections.json + sections/list-collections-template.liquid.
// Server Component — no interactivity here.
export default async function CollectionsIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const collections = await getCollections();

  return (
    <>
      <BodyClass name="template-list-collections" />
      <JsonLd
        data={breadcrumbLd(
          [
            { name: 'Начало', path: routes.home },
            { name: 'Колекции', path: routes.collections },
          ],
          locale,
        )}
      />
      <ListCollectionsTemplate collections={collections} />
    </>
  );
}

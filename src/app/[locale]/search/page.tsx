import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { searchProducts } from '@/data/catalog';
import { BodyClass } from '@/components/util/BodyClass';
import { SearchTemplate } from '@/components/templates/SearchTemplate';

export const metadata: Metadata = {
  title: 'Резултати от търсенето – easytech3d',
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { q } = await searchParams;
  // Normalise: take the first value if an array was passed (Shopify allows ?q=a&q=b).
  const query = (Array.isArray(q) ? q[0] : q) ?? '';

  const results = query.trim() ? searchProducts(query.trim()) : [];

  return (
    <main>
      {/* body.template-search — mirrors Liquid's <body class="template-search ..."> */}
      <BodyClass name="template-search" />
      <SearchTemplate query={query} results={results} />
    </main>
  );
}

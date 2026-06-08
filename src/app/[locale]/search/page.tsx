import { setRequestLocale } from 'next-intl/server';
import { SearchPage } from '@/features/search/SearchPage';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Search({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { q } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;

  return (
    <main>
      <SearchPage query={query} />
    </main>
  );
}

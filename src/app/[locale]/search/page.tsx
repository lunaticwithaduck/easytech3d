import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SearchTemplate } from '@/components/templates/SearchTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { searchCatalog } from '@/data/catalog';
import { buildMetadata } from '@/lib/seo';
import type { SortKey } from '@/lib/shopify/types';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    available?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Search-results pages are per-query and thin — keep them out of the index (mirrors robots.ts).
  return buildMetadata({
    locale,
    path: routes.search,
    title: 'Търсене',
    description: 'Търсете в каталога на EasyTech3D.',
    noindex: true,
  });
}

const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const query = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const filters = {
    available:
      sp.available === 'in'
        ? ('in' as const)
        : sp.available === 'out'
          ? ('out' as const)
          : undefined,
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    sort: (sp.sort as SortKey) || undefined,
  };

  const result = await searchCatalog({ q: query, ...filters });

  return (
    <main>
      {/* body.template-search — mirrors Liquid's <body class="template-search ..."> */}
      <BodyClass name="template-search" />
      <SearchTemplate query={query} result={result} filters={filters} />
    </main>
  );
}

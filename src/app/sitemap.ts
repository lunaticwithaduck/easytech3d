import type { MetadataRoute } from 'next';
import { routes } from '@/config/routes';
import { getAllProducts, getArticles, getCollections } from '@/data/catalog';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

// XML sitemap for every locale, with hreflang alternates per entry. Covers home, the collections
// index + each collection, every product, the blog index + each article, and the key static pages.
// Cart/search are intentionally excluded (also disallowed in robots.ts).

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
};

function localeHref(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path === '/' ? '' : path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, products] = await Promise.all([getCollections(), getAllProducts()]);
  const articles = getArticles();

  const entries: Entry[] = [
    { path: routes.home, priority: 1, changeFrequency: 'daily' },
    { path: routes.collections, priority: 0.8, changeFrequency: 'weekly' },
    { path: routes.contact, priority: 0.5, changeFrequency: 'yearly' },
    { path: routes.printOnOrder, priority: 0.5, changeFrequency: 'yearly' },
    ...collections.map((c) => ({
      path: routes.collection(c.handle),
      priority: 0.7,
      changeFrequency: 'weekly' as const,
    })),
    ...products.map((p) => ({
      path: routes.product(p.handle),
      priority: 0.6,
      changeFrequency: 'weekly' as const,
    })),
    ...articles.map((a) => ({
      path: routes.article(a.blogHandle, a.handle),
      priority: 0.4,
      changeFrequency: 'monthly' as const,
    })),
  ];
  // Blog index (derived from the first article's blog handle, when present).
  if (articles[0]) {
    entries.push({
      path: routes.blogIndex(articles[0].blogHandle),
      priority: 0.5,
      changeFrequency: 'weekly',
    });
  }

  return entries.map(({ path, priority, changeFrequency }) => ({
    url: localeHref(routing.defaultLocale, path),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, localeHref(l, path)])),
    },
  }));
}

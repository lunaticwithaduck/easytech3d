import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArticlePage } from '@/features/article/ArticlePage';
import { getArticle } from '@/server/catalog/data';

type Props = {
  params: Promise<{ locale: string; blog: string; slug: string }>;
};

// Single blog article. `params` is a Promise in Next 16 — await it, then resolve the article by
// (blog, slug); a missing article 404s. Server Component (data only); ArticlePage is the view.
export default async function ArticleRoute({ params }: Props) {
  const { locale, blog, slug } = await params;
  setRequestLocale(locale);

  const article = getArticle(blog, slug);
  if (!article) notFound();

  return <ArticlePage article={article} />;
}

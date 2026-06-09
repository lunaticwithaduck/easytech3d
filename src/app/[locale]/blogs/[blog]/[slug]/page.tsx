import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticle } from '@/data/catalog';
import { BodyClass } from '@/components/util/BodyClass';
import { ArticleTemplate } from '@/components/templates/ArticleTemplate';

type Props = {
  params: Promise<{ locale: string; blog: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blog, slug } = await params;
  const article = getArticle(decodeURIComponent(blog), decodeURIComponent(slug));
  if (!article) return {};
  return { title: `${article.title} – easytech3d` };
}

// Single blog article page. `params` is a Promise in Next 16 — await it, resolve the article by
// (blog, slug), and 404 if not found. Server Component; ArticleTemplate is the pure-RSC view.
export default async function ArticleRoute({ params }: Props) {
  const { locale, blog, slug } = await params;
  setRequestLocale(locale);

  const article = getArticle(decodeURIComponent(blog), decodeURIComponent(slug));
  if (!article) notFound();

  return (
    <>
      <BodyClass name="template-article" />
      <ArticleTemplate article={article} />
    </>
  );
}

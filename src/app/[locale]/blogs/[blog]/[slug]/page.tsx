import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArticleTemplate } from '@/components/templates/ArticleTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { JsonLd } from '@/components/util/JsonLd';
import { routes } from '@/config/routes';
import { getArticle, getBlog } from '@/data/catalog';
import { articleLd, breadcrumbLd, buildMetadata, stripHtml } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string; blog: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, blog, slug } = await params;
  const article = getArticle(decodeURIComponent(blog), decodeURIComponent(slug));
  if (!article) return {};
  return buildMetadata({
    locale,
    path: routes.article(article.blogHandle, article.handle),
    title: article.title,
    description: stripHtml(article.excerpt || article.contentHtml),
    type: 'article',
    images: article.image
      ? [{ url: article.image.src, alt: article.image.alt || article.title }]
      : undefined,
  });
}

// Single blog article page. `params` is a Promise in Next 16 — await it, resolve the article by
// (blog, slug), and 404 if not found. Server Component; ArticleTemplate is the pure-RSC view.
export default async function ArticleRoute({ params }: Props) {
  const { locale, blog, slug } = await params;
  setRequestLocale(locale);

  const article = getArticle(decodeURIComponent(blog), decodeURIComponent(slug));
  if (!article) notFound();

  const blogTitle = getBlog(article.blogHandle)?.title ?? 'Блог';

  return (
    <>
      <BodyClass name="template-article" />
      <JsonLd
        data={[
          articleLd(article, locale),
          breadcrumbLd(
            [
              { name: 'Начало', path: routes.home },
              { name: blogTitle, path: routes.blogIndex(article.blogHandle) },
              { name: article.title, path: routes.article(article.blogHandle, article.handle) },
            ],
            locale,
          ),
        ]}
      />
      <ArticleTemplate article={article} />
    </>
  );
}

import { setRequestLocale } from 'next-intl/server';
import { BlogIndex } from '@/features/blog/BlogIndex';
import { getArticles } from '@/server/catalog/data';

type Props = {
  params: Promise<{ locale: string; blog: string }>;
};

// Blog index route: /blogs/[blog]. Renders the blog header + article grid for the requested blog.
// In Next 16 `params` is a Promise — await it before use, then enable static rendering for the locale.
export default async function BlogPage({ params }: Props) {
  const { locale, blog } = await params;
  setRequestLocale(locale);

  // The mock catalog serves a single blog; filter defensively so the route stays correct once the
  // backend serves multiple blogs. Fall back to all articles so the page always populates.
  const all = getArticles();
  const articles = all.filter((article) => article.blogHandle === blog);

  return <BlogIndex articles={articles.length > 0 ? articles : all} />;
}

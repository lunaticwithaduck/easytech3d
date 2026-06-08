import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import type { Article } from '@/server/catalog/types';
import { bodyVariants, emptyStateVariants, gridVariants } from './BlogIndex.styles';
import { ArticleCard } from './components/ArticleCard/ArticleCard';
import { BlogHeader } from './components/BlogHeader/BlogHeader';
import { BLOG_TITLE } from './config/constants';

export type BlogIndexProps = {
  /** The blog title shown in the banner header (the live theme uses "Блог"). */
  title?: string;
  /** Articles for this blog, newest first as served by getArticles(). */
  articles: Article[];
};

// Blog index screen — 1:1 port of `sections/blog-template.liquid` (layout `grid`): the banner
// header (`custom_page_header`) with the blog title overlaid on the header image, then a 3-per-row
// grid of article cards inside `.page-width`. Server Component — all data comes from the route.
export function BlogIndex({ title = BLOG_TITLE, articles }: BlogIndexProps) {
  return (
    <main>
      <BlogHeader title={title} />

      <Container>
        <div className={bodyVariants()}>
          {articles.length === 0 ? (
            <Text
              as="p"
              size="lg"
              color="muted"
              className={emptyStateVariants()}
              value="Все още няма публикувани статии."
            />
          ) : (
            <ul className={gridVariants()}>
              {articles.map((article) => (
                <li key={article.id}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </main>
  );
}

import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import type { Article } from '@/server/catalog/types';
import { BlogHeader } from './components/BlogHeader/BlogHeader';
import { ArticleCard } from './components/ArticleCard/ArticleCard';
import { emptyStateVariants, gridVariants } from './BlogIndex.styles';

export type BlogIndexProps = {
  /** The blog title shown in the header (the live theme uses "Блог"). */
  title?: string;
  /** Articles for this blog, newest first as served by getArticles(). */
  articles: Article[];
};

// Blog index screen: the page header (title + breadcrumbs) followed by a responsive grid of
// article cards. Composes the shared Container/Section + the blog ArticleCard. Server Component —
// all data is passed in from the route.
export function BlogIndex({ title, articles }: BlogIndexProps) {
  return (
    <main>
      <BlogHeader title={title} />

      <Section>
        <Container>
          {articles.length === 0 ? (
            <Text
              as="p"
              size="lg"
              color="muted"
              className={emptyStateVariants()}
              value="Все още няма публикувани статии."
            />
          ) : (
            <div className={gridVariants()}>
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}

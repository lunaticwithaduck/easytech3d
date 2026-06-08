import { routes } from '@/config/routes';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import type { Article } from '@/server/catalog/types';
import { HOME_COPY } from '../../config/constants';
import { formatArticleDate } from '../../utils/date.utils';
import {
  blogAuthorClass,
  blogCardClass,
  blogGridClass,
  blogImageClass,
  blogImageWrapClass,
  blogInfoClass,
  blogMetaClass,
  blogTitleClass,
} from './FeaturedBlogRow.styles';

export type FeaturedBlogConfig = {
  title: string;
  subtitle: string;
  blogHandle: string;
};

export type FeaturedBlogRowProps = {
  config: FeaturedBlogConfig;
  articles: Article[];
};

// featured-blog.liquid — "Проверете нашият блог": a centered SectionHeading (eyebrow + title)
// over a 4-up grid of article cards. Each card (`article.article_block`) is the image link
// (`a.article__link`) followed by `.article_block_info` (author "от {author}", the h4 title link,
// and the published-date meta row). Mirrors the non-carousel grid the home page renders
// (4 posts == blogs_per_row ⇒ static `ul.grid--blog` of `medium-up--one-quarter` items).
export function FeaturedBlogRow({ config, articles }: FeaturedBlogRowProps) {
  const items = articles.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <Section>
      <Container>
        <SectionHeading title={config.title} subtitle={config.subtitle} align="center" />

        <ul className={blogGridClass}>
          {items.map((article) => {
            const href = routes.article(article.blogHandle, article.handle);
            return (
              <li key={article.id}>
                <article className={blogCardClass}>
                  <Link href={href} variant="unstyled" className={blogImageWrapClass}>
                    <Image
                      src={article.image.url}
                      alt={article.image.alt || article.title}
                      fill
                      sizes="(min-width: 750px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className={blogImageClass}
                    />
                  </Link>

                  <div className={blogInfoClass}>
                    <Text
                      as="span"
                      size="sm"
                      color="muted"
                      className={blogAuthorClass}
                      value={HOME_COPY.blogByAuthor}
                      params={{ author: article.author }}
                    />

                    <Link href={href} variant="unstyled">
                      <Heading as="h4" className={blogTitleClass}>
                        {article.title}
                      </Heading>
                    </Link>

                    <div className={blogMetaClass}>
                      <Text as="span" size="sm" color="muted">
                        {formatArticleDate(article.publishedAt)}
                      </Text>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

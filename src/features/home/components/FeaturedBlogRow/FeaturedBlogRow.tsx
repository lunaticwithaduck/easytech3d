import { ArrowRight } from 'lucide-react';
import { routes } from '@/config/routes';
import { Icon } from '@/design-system/primitives/Icon/Icon';
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
  blogBodyClass,
  blogCardClass,
  blogExcerptClass,
  blogGridClass,
  blogImageClass,
  blogImageWrapClass,
  blogReadMoreClass,
  blogRootClass,
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

// "Проверете нашият блог": a heading over a 4-up grid of article cards (image, date, title,
// excerpt) — each card links to the article page.
export function FeaturedBlogRow({ config, articles }: FeaturedBlogRowProps) {
  const items = articles.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className={blogRootClass}>
          <SectionHeading title={config.title} subtitle={config.subtitle} align="center" />

          <div className={blogGridClass}>
            {items.map((article) => (
              <Link
                key={article.id}
                href={routes.article(article.blogHandle, article.handle)}
                variant="unstyled"
                className={blogCardClass}
              >
                <span className={blogImageWrapClass}>
                  <Image
                    src={article.image.url}
                    alt={article.image.alt || article.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className={blogImageClass}
                  />
                </span>
                <div className={blogBodyClass}>
                  <Text as="span" size="xs" color="muted">
                    {formatArticleDate(article.publishedAt)}
                  </Text>
                  <Text as="h3" size="lg" weight="semibold" className={blogTitleClass}>
                    {article.title}
                  </Text>
                  <Text as="p" size="sm" color="muted" className={blogExcerptClass}>
                    {article.excerpt}
                  </Text>
                  <span className={blogReadMoreClass}>
                    <Text
                      as="span"
                      size="sm"
                      weight="semibold"
                      color="primary"
                      value={HOME_COPY.blogReadMore}
                    />
                    <Icon icon={ArrowRight} size={16} className="text-primary" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

import { routes } from '@/config/routes';
import { cn } from '@/design-system/lib/cn';
import { TailRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { Article } from '@/server/catalog/types';
import { ARTICLE_AUTHOR_PREFIX, READ_MORE_LABEL } from '../../config/constants';
import { formatArticleDate } from '../../utils/formatDate.utils';
import {
  authorVariants,
  cardVariants,
  excerptVariants,
  imageVariants,
  infoVariants,
  mediaVariants,
  metaVariants,
  readMoreIconClass,
  readMoreRowVariants,
  titleLinkVariants,
  titleVariants,
} from './ArticleCard.styles';

export type ArticleCardProps = {
  article: Article;
  className?: string | undefined;
};

// Grid tile for one blog article — 1:1 port of the Liquid `article_block` (blog-template.liquid):
// a linked image (radius 10), then the info stack: author "от {author}", the h4 title, the date,
// an excerpt, and the "Прочети повече" secondary button — all pointing at the article page.
export function ArticleCard({ article, className }: ArticleCardProps) {
  const href = routes.article(article.blogHandle, article.handle);

  return (
    <article className={cn(cardVariants(), className)}>
      <Link href={href} variant="unstyled" className={mediaVariants()}>
        <Image
          src={article.image.url}
          alt={article.image.alt || article.title}
          fill
          sizes="(min-width: 750px) calc(100vw / 3), 100vw"
          className={imageVariants()}
        />
      </Link>

      <div className={infoVariants()}>
        <Text
          as="span"
          size="sm"
          color="muted"
          className={authorVariants()}
          value={`${ARTICLE_AUTHOR_PREFIX} {author}`}
          params={{ author: article.author }}
        />

        <Link href={href} variant="unstyled" className={titleLinkVariants()}>
          <Heading as="h4" className={titleVariants()}>
            {article.title}
          </Heading>
        </Link>

        <div className={metaVariants()}>
          <Text as="span" size="sm" color="muted">
            {formatArticleDate(article.publishedAt)}
          </Text>
        </div>

        <Text as="p" size="sm" color="muted" className={excerptVariants()}>
          {article.excerpt}
        </Text>

        <div className={readMoreRowVariants()}>
          <Button asChild variant="secondary" size="sm">
            <Link href={href} variant="unstyled">
              <Text as="span" color="current" value={READ_MORE_LABEL} />
              <TailRightIcon className={readMoreIconClass} aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

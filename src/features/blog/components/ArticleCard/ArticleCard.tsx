import { ArrowRight } from 'lucide-react';
import { routes } from '@/config/routes';
import { cn } from '@/design-system/lib/cn';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { Article } from '@/server/catalog/types';
import { READ_MORE_LABEL } from '../../config/constants';
import { formatArticleDate } from '../../utils/formatDate.utils';
import {
  cardVariants,
  excerptVariants,
  imageVariants,
  infoVariants,
  mediaVariants,
  readMoreVariants,
  titleVariants,
} from './ArticleCard.styles';

export type ArticleCardProps = {
  article: Article;
  className?: string | undefined;
};

// Grid tile for a single blog article, reused by the blog index grid (and the home featured-blog
// row shape). Mirrors the Liquid `article_block`: a linked landscape image, the title, the
// published date, an excerpt, and a "Прочети повече" link — all pointing at the article page.
export function ArticleCard({ article, className }: ArticleCardProps) {
  const href = routes.article(article.blogHandle, article.handle);

  return (
    <article className={cn(cardVariants(), className)}>
      <Link href={href} variant="unstyled" className={mediaVariants()}>
        <Image
          src={article.image.url}
          alt={article.image.alt || article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={imageVariants()}
        />
      </Link>

      <div className={infoVariants()}>
        <Text as="span" size="xs" weight="medium" color="muted">
          {formatArticleDate(article.publishedAt)}
        </Text>

        <Link href={href} variant="unstyled">
          <Text as="h3" size="lg" weight="semibold" className={titleVariants()}>
            {article.title}
          </Text>
        </Link>

        <Text as="p" size="sm" color="muted" className={excerptVariants()}>
          {article.excerpt}
        </Text>

        <Link href={href} variant="unstyled" className={readMoreVariants()}>
          <Text as="span" size="sm" weight="semibold" color="current" value={READ_MORE_LABEL} />
          <Icon icon={ArrowRight} size={16} />
        </Link>
      </div>
    </article>
  );
}

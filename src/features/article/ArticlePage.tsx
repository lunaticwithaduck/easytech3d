import { ArrowLeft } from 'lucide-react';
import { routes } from '@/config/routes';
import { Image } from '@/design-system/primitives/Image/Image';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import type { Article } from '@/server/catalog/types';
import {
  backLinkRowVariants,
  backLinkVariants,
  bodyWrapVariants,
  heroImageVariants,
  heroMediaVariants,
  heroOverlayVariants,
  heroScrimVariants,
  heroTitleVariants,
  metaDotVariants,
  metaRowVariants,
  proseVariants,
  heroVariants,
} from './ArticlePage.styles';
import {
  ARTICLE_AUTHOR_PREFIX,
  ARTICLE_BACK_TO_BLOG,
  ARTICLE_BLOG_CRUMB,
} from './config/constants';
import { formatArticleDate } from './utils/formatDate.utils';

export type ArticlePageProps = {
  article: Article;
};

// Single-article view (port of sections/article-template.liquid + custom_page_header). A full-bleed
// hero shows the featured image under a dark scrim, with breadcrumbs and the H1 title overlaid at
// the bottom-left; an author · date meta line follows, then the article body in a styled prose
// column, and a "back to blog" link. Header/footer come from the layout — not added here.
export function ArticlePage({ article }: ArticlePageProps) {
  const publishedDate = formatArticleDate(article.publishedAt);

  return (
    <main>
      <header className={heroVariants()}>
        <div className={heroMediaVariants()}>
          <Image
            src={article.image.url}
            alt={article.image.alt || article.title}
            fill
            sizes="100vw"
            priority
            className={heroImageVariants()}
          />
        </div>
        <div aria-hidden className={heroScrimVariants()} />

        <Container className={heroOverlayVariants()}>
          <Breadcrumbs
            items={[
              { label: ARTICLE_BLOG_CRUMB, href: routes.blog },
              { label: article.title },
            ]}
          />
          <Text as="h1" size="4xl" weight="bold" color="inverse" className={heroTitleVariants()}>
            {article.title}
          </Text>
          <div className={metaRowVariants()}>
            <Text as="span" size="sm" color="paper">
              {`${ARTICLE_AUTHOR_PREFIX} ${article.author}`}
            </Text>
            {publishedDate ? (
              <>
                <Text as="span" size="sm" color="paper" className={metaDotVariants()} value="·" />
                <Text as="span" size="sm" color="paper">
                  {publishedDate}
                </Text>
              </>
            ) : null}
          </div>
        </Container>
      </header>

      <Container size="narrow" className={bodyWrapVariants()}>
        {/* Article body is server-rendered HTML from the catalog API (Liquid `{{ article.content }}`). */}
        <div
          className={proseVariants()}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted CMS article HTML.
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        <div className={backLinkRowVariants()}>
          <Link href={routes.blog} variant="primary" className={backLinkVariants()}>
            <ArrowLeft aria-hidden size={16} />
            <Text as="span" color="current" value={ARTICLE_BACK_TO_BLOG} />
          </Link>
        </div>
      </Container>
    </main>
  );
}

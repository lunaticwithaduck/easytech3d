import { routes } from '@/config/routes';
import { TailLeftIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import { PageBanner } from '@/features/_shared/PageBanner/PageBanner';
import type { Article } from '@/server/catalog/types';
import {
  backLinkIconClass,
  backLinkRowVariants,
  bodyWrapVariants,
  metaDotVariants,
  metaRowVariants,
  proseVariants,
} from './ArticlePage.styles';
import {
  ARTICLE_AUTHOR_PREFIX,
  ARTICLE_BACK_TO_BLOG,
  ARTICLE_BLOG_CRUMB,
  ARTICLE_OVERLAY_OPACITY,
} from './config/constants';
import { formatArticleDate } from './utils/formatDate.utils';

export type ArticlePageProps = {
  article: Article;
};

// Single-article view — 1:1 port of `sections/article-template.liquid` + `custom_page_header`
// (use_featured_image on). The featured image fills a hero band under a #000 @ 40% scrim with the
// title overlaid bottom-left; breadcrumbs (Блог › title) and an "от {author} · {date}" meta line
// follow. Below, the `article.content` renders in an `rte` prose column, then a back-to-blog link.
// Header/footer come from the layout shell — not added here.
export function ArticlePage({ article }: ArticlePageProps) {
  const blogHref = routes.blogIndex(article.blogHandle);
  const publishedDate = formatArticleDate(article.publishedAt);

  return (
    <main>
      <PageBanner
        image={article.image}
        heading={article.title}
        overlayOpacity={ARTICLE_OVERLAY_OPACITY}
      >
        <Breadcrumbs
          items={[{ label: ARTICLE_BLOG_CRUMB, href: blogHref }, { label: article.title }]}
        />
        <div className={metaRowVariants()}>
          <Text
            as="span"
            size="sm"
            color="current"
            value={`${ARTICLE_AUTHOR_PREFIX} {author}`}
            params={{ author: article.author }}
          />
          {publishedDate ? (
            <>
              <Text as="span" size="sm" color="current" className={metaDotVariants()} value="·" />
              <Text as="span" size="sm" color="current">
                {publishedDate}
              </Text>
            </>
          ) : null}
        </div>
      </PageBanner>

      <Container size="narrow">
        <div className={bodyWrapVariants()}>
          {/* Article body is server-rendered HTML (Liquid `{{ article.content }}`) from the catalog. */}
          <div
            className={proseVariants()}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted CMS article HTML.
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          <div className={backLinkRowVariants()}>
            <Button asChild variant="secondary" size="sm">
              <Link href={blogHref} variant="unstyled">
                <TailLeftIcon className={backLinkIconClass} aria-hidden />
                <Text as="span" color="current" value={ARTICLE_BACK_TO_BLOG} />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}

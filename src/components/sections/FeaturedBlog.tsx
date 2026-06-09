import { Link } from '@/i18n/navigation';
import type { featuredBlogSection } from '@/data/home';
import type { ShopArticle } from '@/lib/shopify/types';
import { imageUrl, imageSrcset } from '@/lib/shopify/image';

// Grid class mapping: blogs_per_row → medium-up--one-{fraction}
const GRID_CLASS: Record<number, string> = {
  2: 'medium-up--one-half',
  3: 'medium-up--one-third',
  4: 'medium-up--one-quarter',
  5: 'medium-up--one-fifth',
};

/** Format an ISO date string as the theme does: "July 29, 2024" */
function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function FeaturedBlog({
  section,
  articles,
}: {
  section: typeof featuredBlogSection;
  articles: ShopArticle[];
}) {
  const gridItemClass = GRID_CLASS[section.postsPerRow] ?? 'medium-up--one-quarter';
  const limited = articles.slice(0, section.postLimit);

  return (
    <section
      data-section-type="featured-blog"
      className=""
    >
      <div className="page-width">
        {(section.title || section.subtitle) && (
          <header className="section-header text-center  homepage_subtitle_style_match_header">
            {section.subtitle && (
              <span className="h5">{section.subtitle}</span>
            )}
            {section.title && (
              <h2>{section.title}</h2>
            )}
          </header>
        )}

        {/* enable_carousel is false — render the static grid */}
        <ul className="zoom-fade-animation grid grid--uniform grid--blog">
          {limited.map((article, index) => (
            <li
              key={article.id}
              className={`grid__item ${gridItemClass} zoom-fade-animation-element-wrapper`}
            >
              <article
                className="article_block"
                aria-labelledby={`FeaturedBlogTitle-${index}`}
              >
                <Link href={article.url} className="article__link">
                  {article.image && (
                    <>
                      <div
                        id={`ArticleImageWrapper-${article.id}`}
                        className="article__grid-image-wrapper js"
                      >
                        <div className="article__grid-image-container">
                          <img
                            id={`ArticleImage-${article.id}`}
                            className="article__grid-image zoom-fade-animation-element"
                            srcSet={imageSrcset(article.image.src, article.image.width)}
                            src={imageUrl(article.image.src, 535)}
                            sizes={`(min-width: 750px) calc(100vw / ${section.postsPerRow}), 100vw`}
                            loading="lazy"
                            width={article.image.width}
                            height={article.image.height}
                            alt={article.image.alt || article.title}
                          />
                          <div className="load_media_spinner">
                            <div className="rect1"></div>
                            <div className="rect2"></div>
                            <div className="rect3"></div>
                            <div className="rect4"></div>
                            <div className="rect5"></div>
                          </div>
                        </div>
                      </div>
                      <noscript>
                        <div className="article__grid-image-wrapper">
                          <img
                            src={imageUrl(article.image.src, 345)}
                            alt={article.title}
                            className="article__grid-image"
                          />
                        </div>
                      </noscript>
                    </>
                  )}
                </Link>

                <div className="article_block_info">
                  {section.showAuthor && (
                    <span className="article__author text_name">
                      {`от ${article.author}`}
                    </span>
                  )}

                  <Link
                    href={article.url}
                    className="article__title h4"
                    id={`FeaturedBlogTitle-${index}`}
                  >
                    {article.title}
                  </Link>

                  <div className="article__grid-meta">
                    {section.showDate && (
                      <span className="article__date">
                        <time dateTime={article.publishedAt}>
                          {formatArticleDate(article.publishedAt)}
                        </time>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

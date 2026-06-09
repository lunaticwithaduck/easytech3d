import type { ShopArticle, ShopBlog } from '@/lib/shopify/types';
import { imageUrl, imageSrcset } from '@/lib/shopify/image';
import { Icon } from '@/components/snippets/Icon';
import { Link } from '@/i18n/navigation';

// Translated from tools/output/liquid-template/sections/blog-template.liquid
// Ground-truth classes confirmed against:
//   tools/output/reference/mirror/blogs/3%D0%B4-%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%BE%D0%B2%D0%B5/index.html
//
// The live blog uses layout="grid" (3 columns) and show_excerpt=true, blog_show_date=true.
// No header image on this blog → custom_page_header renders the no-image branch:
//   <div class="page-width"><div class="section-header"><h1 ...>…</h1></div></div>
// The section id is omitted (irrelevant for RSC; theme CSS doesn't key on it).

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogTemplate({
  blog,
  articles,
}: {
  blog: ShopBlog;
  articles: ShopArticle[];
}) {
  return (
    <>
      {/* custom_page_header — no-image branch */}
      <div className="page-width">
        <div className="section-header">
          <h1 className=" h2 page_header_heading">{blog.title}</h1>
        </div>
      </div>

      <section data-section-type="blog-page">
        <div className="page-width">
          <div className="blog_page_layout layout_grid">
            <div className="blogs-wrapper">
              <ul className="grid grid--uniform zoom-fade-animation">
                {articles.map((article, i) => (
                  <li
                    key={article.id}
                    className="zoom-fade-animation-element-wrapper grid__item mobile--one-whole small--one-half  medium-up--one-third"
                  >
                    <article
                      className="article_block"
                      aria-labelledby={`FeaturedBlogTitle-${i}`}
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
                                  sizes="(min-width: 750px) calc(100vw / 3), 100vw"
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
                                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                        <h4
                          className="article__title"
                          id={`FeaturedBlogTitle-${i}`}
                        >
                          <Link href={article.url}>{article.title}</Link>
                        </h4>

                        {/* blog_show_author = true (default), no custom logo → text_name branch */}
                        <span className="article__author  text_name">
                          {/* {{ 'blogs.article.by_author' | t: author: article.author }} */}
                          от {article.author}
                        </span>

                        <div className="article__grid-meta">
                          {/* blog_show_date = true (section default) */}
                          <span className="article__date">
                            <time dateTime={article.publishedAt}>
                              {formatDate(article.publishedAt)}
                            </time>
                          </span>
                        </div>

                        {/* show_excerpt = true (section default) */}
                        {article.excerpt && (
                          <div className="article__list-excerpt">
                            {article.excerpt}
                          </div>
                        )}

                        <div className="article__list-btn">
                          <Link href={article.url} className="btn btn--secondary">
                            {/* {{ 'blogs.article.read_more' | t }} */}
                            <span>Прочетете още</span>
                            <Icon name="tail-right" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

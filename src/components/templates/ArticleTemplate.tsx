import type { ShopArticle } from '@/lib/shopify/types';
import { imageSrcset, imageUrl } from '@/lib/shopify/image';
import { Breadcrumbs } from '@/components/snippets/Breadcrumbs';
import { Rte } from '@/components/snippets/Rte';

/**
 * Translation of sections/article-template.liquid + snippets/custom_page_header.liquid
 * + snippets/article_author_block.liquid.
 *
 * Section settings used (schema defaults):
 *   use_featured_image: true  → article.image becomes the hero header
 *   show_breadcrumbs:   true
 *   blog_show_date:     true
 *   blog_show_author:   true
 *   show_article_tags:  true
 *   show_share_buttons: true
 *   image_overlay_color: #000
 *   image_overlay_opacity: 40
 *
 * Ground truth verified against:
 *   tools/output/reference/mirror/blogs/3д-принтове/3d-printers-5-models/index.html
 */

function formatDate(iso: string): string {
  // Liquid's `time_tag: format: 'date'` renders the locale-formatted date.
  // We use Bulgarian-friendly long format to match the live site output.
  return new Date(iso).toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Inline replica of snippets/custom_page_header.liquid (article mode, image != blank). */
function ArticlePageHeader({ article }: { article: ShopArticle }) {
  const image = article.image;
  if (!image) return null;

  const srcset = imageSrcset(image.src, image.width);
  const src = imageUrl(image.src, 750);

  return (
    <div className="custom_page_header_section article_custom_header_with_author_info">
      {/* Hero image */}
      <img
        className=""
        srcSet={srcset}
        src={src}
        sizes="100vw"
        loading="lazy"
        alt={image.alt || article.title}
        width={image.width}
        height={image.height}
        style={{ objectPosition: '' }}
      />

      <div className="custom_page_header_opacity"></div>

      <div className="page-width">
        <h1 className="h2 page_header_heading">{article.title}</h1>

        {/* blog_show_date: true  |  blog_show_author: true */}
        <div className="article-page">
          <div className="article_header_meta-info">
            <div className="article__grid-meta">
              {/* blog_show_date */}
              <span className="article__date">
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              </span>
            </div>

            {/* blog_show_author — no custom author settings in fixtures → default_author_info */}
            <span className="article__author  text_name default_author_info">
              {'от '}
              {article.author}
            </span>
          </div>
        </div>
      </div>

      {/* Section-scoped style the Liquid emits (exact values from schema defaults). */}
      <style>{`
        #shopify-section-header {
          position: absolute;
          top: var(--announcement-bar-height);
        }
        .custom_page_header_opacity {
          background: #000;
          opacity: 40%;
        }
      `}</style>
    </div>
  );
}

/** Inline replica of snippets/custom_page_header.liquid (no image — fallback heading + breadcrumbs). */
function ArticleHeaderNoImage({
  article,
  breadcrumbs,
}: {
  article: ShopArticle;
  breadcrumbs: { title: string; url?: string }[];
}) {
  return (
    <div className="section-header text-left section-header_without_image">
      <h1 className="article__title h2" id="title-0">
        {article.title}
      </h1>

      <Breadcrumbs items={breadcrumbs} />

      <div className="article_header_meta-info">
        <div className="article__grid-meta">
          {/* blog_show_date */}
          <span className="article__date">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </span>
        </div>

        {/* blog_show_author */}
        <span className="article__author  text_name default_author_info">
          {'от '}
          {article.author}
        </span>
      </div>
    </div>
  );
}

export function ArticleTemplate({ article }: { article: ShopArticle }) {
  const hasImage = article.image !== null;

  // Breadcrumb items: Начало → blog title (fallback label) → article title
  const breadcrumbs = [
    { title: 'Начало', url: '/' },
    { title: '3Д Принтове', url: `/blogs/${article.blogHandle}` },
    { title: article.title, url: article.url },
  ];

  return (
    <>
      {/* Custom page header (with hero image when use_featured_image + image present) */}
      {hasImage ? (
        <ArticlePageHeader article={article} />
      ) : null}

      <section data-section-type="article-page">
        {/*
         * article element: show_share_buttons=true → NO show_full_rte class (per the liquid:
         *   {% unless section.settings.show_share_buttons %} show_full_rte {% endunless %}
         * In the rendered mirror the class list is just "page-width-small article-page  ".
         */}
        <article className="page-width-small article-page  ">

          {/* When no image: show the header with h1 + breadcrumbs inside the article */}
          {!hasImage && (
            <ArticleHeaderNoImage article={article} breadcrumbs={breadcrumbs} />
          )}

          <div className="article-content-wrapper">
            {/*
            * The liquid wraps `{{ article.content }}` in <div class="rte">.
            * Rte already emits <div className="rte">, so pass the html directly.
            * show_article_tags: true — ShopArticle has no tags field; omitted.
            */}
            <Rte html={article.contentHtml} />

            {/* show_share_buttons: true */}
            <div className="article-social-sharing">
              <ul className="social-sharing">
                <li>
                  <a
                    target="_blank"
                    href={`//www.facebook.com/sharer.php?u=${article.url}`}
                    className=" btn--small btn--share share-facebook"
                    rel="noopener noreferrer"
                    aria-label="Share on Facebook"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      className="icon icon-facebook"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill="#444"
                        d="M18.05.811q.439 0 .744.305t.305.744v16.637q0 .439-.305.744t-.744.305h-4.732v-7.221h2.415l.342-2.854h-2.757v-1.83q0-.659.293-1t1.073-.342h1.488V3.762q-.976-.098-2.171-.098-1.634 0-2.635.964t-1 2.72V9.47H7.951v2.854h2.415v7.221H1.413q-.439 0-.744-.305t-.305-.744V1.859q0-.439.305-.744T1.413.81H18.05z"
                      />
                    </svg>
                    <span className="visually-hidden">Share on Facebook</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href={`//twitter.com/share?text=${encodeURIComponent(article.title)}&url=${article.url}`}
                    className=" btn--small btn--share share-twitter"
                    rel="noopener noreferrer"
                    aria-label="Tweet on Twitter"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      className="icon icon-twitter"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill="#444"
                        d="M19.551 4.208q-.815 1.202-1.956 2.038 0 .082.02.255t.02.255q0 1.589-.469 3.179t-1.426 3.036-2.272 2.567-3.158 1.793-3.963.672q-3.301 0-6.031-1.773.571.041.937.041 2.751 0 4.911-1.671-1.284-.02-2.292-.784T2.456 11.85q.346.082.754.082.55 0 1.039-.163-1.365-.285-2.262-1.365T1.09 7.918v-.041q.774.408 1.773.448-.795-.53-1.263-1.396t-.469-1.864q0-1.019.509-1.997 1.487 1.854 3.596 2.924T9.81 7.184q-.143-.509-.143-.897 0-1.63 1.161-2.781t2.832-1.151q.815 0 1.569.326t1.284.917q1.345-.265 2.506-.958-.428 1.386-1.732 2.18 1.243-.163 2.262-.611z"
                      />
                    </svg>
                    <span className="visually-hidden">Tweet on Twitter</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href={`//pinterest.com/pin/create/button/?url=${article.url}&description=${encodeURIComponent(article.title)}`}
                    className=" btn--small btn--share share-pinterest"
                    rel="noopener noreferrer"
                    aria-label="Pin on Pinterest"
                  >
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      className="icon icon-pinterest"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill="#444"
                        d="M9.958.811q1.903 0 3.635.744t2.988 2 2 2.988.744 3.635q0 2.537-1.256 4.696t-3.415 3.415-4.696 1.256q-1.39 0-2.659-.366.707-1.147.951-2.025l.659-2.561q.244.463.903.817t1.39.354q1.464 0 2.622-.842t1.793-2.305.634-3.293q0-2.171-1.671-3.769t-4.257-1.598q-1.586 0-2.903.537T5.298 5.897 4.066 7.775t-.427 2.037q0 1.268.476 2.22t1.427 1.342q.171.073.293.012t.171-.232q.171-.61.195-.756.098-.268-.122-.512-.634-.707-.634-1.83 0-1.854 1.281-3.183t3.354-1.329q1.83 0 2.854 1t1.025 2.61q0 1.342-.366 2.476t-1.049 1.817-1.561.683q-.732 0-1.195-.537t-.293-1.269q.098-.342.256-.878t.268-.915.207-.817.098-.732q0-.61-.317-1t-.927-.39q-.756 0-1.269.695t-.512 1.744q0 .39.061.756t.134.537l.073.171q-1 4.342-1.22 5.098-.195.927-.146 2.171-2.513-1.122-4.062-3.44T.59 10.177q0-3.879 2.744-6.623T9.957.81z"
                      />
                    </svg>
                    <span className="visually-hidden">Pin on Pinterest</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* blog_show_author footer block */}
          <div className="article_footer_block">
            {/* Default author info (no custom author lookup in fixture data).
             * blogs.article.by_author BG: "от {{ author }}" */}
            <span className="article__author  text_name default_author_info">
              {'от '}
              {article.author}
            </span>
          </div>
        </article>

        {/* Comments wrapper — blog.comments_enabled: render comment form markup.
         * Strings from rendered ground truth (blogs/.../3d-printers-5-models/index.html). */}
        <div className="article_comments_wrapper">
          <div className="page-width-small">
            <hr aria-hidden="true" />
            <div className="grid">
              <div className="grid__item">
                <div className="comment-form form-vertical">
                  {/* blogs.comments.title BG: "Напиши коментар" */}
                  <h2 className="h3">Напиши коментар</h2>
                  <div className="grid">
                    <div className="grid__item medium-up--one-half">
                      <label htmlFor="CommentForm-author" className="visually-hidden"></label>
                      {/* blogs.comments.name BG: "Твоето Иmе" */}
                      <input
                        type="text"
                        name="comment[author]"
                        id="CommentForm-author"
                        className="input-full"
                        placeholder="Твоето Иmе"
                      />
                    </div>
                    <div className="grid__item medium-up--one-half">
                      <label htmlFor="CommentForm-email" className="visually-hidden"></label>
                      {/* blogs.comments.email BG: "Имейл адрес" */}
                      <input
                        type="email"
                        name="comment[email]"
                        id="CommentForm-email"
                        className="input-full"
                        placeholder="Имейл адрес"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                    </div>
                    <div className="grid__item">
                      <label htmlFor="CommentForm-body" className="visually-hidden"></label>
                      {/* blogs.comments.message BG: "Вашият коментар" */}
                      <textarea
                        name="comment[body]"
                        id="CommentForm-body"
                        className="input-full"
                        placeholder="Вашият коментар"
                      ></textarea>
                    </div>
                  </div>
                  {/* blogs.comments.post BG: "Пост" */}
                  <input type="submit" className="btn" value="Пост" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

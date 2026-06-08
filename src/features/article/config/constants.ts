// BG copy for the article page. Literal strings flow through <Text value=…>; the translate
// fallback renders them verbatim until message keys exist (per the build contract).

// Breadcrumb root label — the blog index ("Блог"), linking back via routes.blog.
export const ARTICLE_BLOG_CRUMB = 'Блог';

// Author meta prefix. Mirrors the live theme's `blogs.article.by_author` → "от {author}".
export const ARTICLE_AUTHOR_PREFIX = 'от';

// Back-to-blog CTA shown beneath the article body.
export const ARTICLE_BACK_TO_BLOG = 'Обратно към блога';

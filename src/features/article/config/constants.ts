// BG copy for the article page. Literal strings flow through <Text value=…>; runtime data
// (title, author, date) stays as children.

// Breadcrumb root label — the blog index ("Блог"), linking back via routes.blogIndex(blog).
export const ARTICLE_BLOG_CRUMB = 'Блог';

// Author meta prefix — the theme's `blogs.article.by_author` → "от {author}".
export const ARTICLE_AUTHOR_PREFIX = 'от';

// Back-to-blog CTA shown beneath the article body (theme `blogs.article.view_all_blogs`).
export const ARTICLE_BACK_TO_BLOG = 'Обратно към блога';

// #000 overlay opacity for the article hero — the theme's `image_overlay_opacity` default (40%).
export const ARTICLE_OVERLAY_OPACITY = 40;

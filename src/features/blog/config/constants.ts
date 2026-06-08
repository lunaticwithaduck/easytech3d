import type { ImageRef } from '@/server/catalog/types';

// Static BG copy + assets for the blog index. The header heading mirrors the live theme's page
// title ("Блог"); the author prefix + read-more come from the Liquid blog-template `article_block`
// (`blogs.article.by_author` → "от {author}", `blogs.article.read_more`).
export const BLOG_TITLE = 'Блог';
export const HOME_BREADCRUMB = 'Начало';

// Author meta prefix — the theme renders `from {author}` as "от {author}" for the BG storefront.
export const ARTICLE_AUTHOR_PREFIX = 'от';

// Read-more CTA on each article card (Liquid `blogs.article.read_more`).
export const READ_MORE_LABEL = 'Прочети повече';

// The blog has no header-image field in the catalog contract yet; the live theme's blog banner uses
// a wide hero photo. Use a real CDN banner so the header band matches the reference 1:1.
export const BLOG_HEADER_IMAGE: ImageRef = {
  url: 'https://cdn.shopify.com/s/files/1/0726/9413/7129/files/baner_2.webp',
  alt: 'Блог',
  width: 1920,
  height: 1080,
};

// Overlay opacity for the blog banner — the theme's `image_overlay_opacity` default (#000 @ 40%).
export const BLOG_OVERLAY_OPACITY = 40;

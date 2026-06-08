import { PageBanner } from '@/features/_shared/PageBanner/PageBanner';
import type { ImageRef } from '@/server/catalog/types';
import { BLOG_HEADER_IMAGE, BLOG_OVERLAY_OPACITY, BLOG_TITLE } from '../../config/constants';

export type BlogHeaderProps = {
  /** The blog title shown as the banner heading (defaults to "Блог"). */
  title?: string;
  /** Optional header image; falls back to the theme's blog banner photo. */
  image?: ImageRef;
};

// Blog index page header — the Liquid `blog-template` renders `custom_page_header` with the blog
// title overlaid on the header image under a #000 @ 40% scrim (breadcrumbs are OFF for the blog per
// blog.json). Thin wrapper over the shared PageBanner so the markup matches collection/article 1:1.
export function BlogHeader({ title = BLOG_TITLE, image = BLOG_HEADER_IMAGE }: BlogHeaderProps) {
  return <PageBanner image={image} heading={title} overlayOpacity={BLOG_OVERLAY_OPACITY} />;
}

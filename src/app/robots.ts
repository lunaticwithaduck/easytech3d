import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// robots.txt — allow everything except the cart and search-results pages (thin / per-session /
// duplicate), and point crawlers at the sitemap. Paths are locale-prefixed (/bg/cart, /en/cart).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/*/cart', '/*/search', '/cart', '/search', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

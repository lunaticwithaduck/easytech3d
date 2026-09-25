import type { MetadataRoute } from 'next';
import { shop } from '@/data/settings';
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/seo';

// Web app manifest (PWA basics + richer install/share metadata).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} – Филаменти и части за 3D печат`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: '/bg',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff1b5c',
    icons: [{ src: shop.logo, sizes: 'any', type: 'image/jpeg' }],
  };
}

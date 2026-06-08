import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Transitional: reference imagery loads from Shopify's public CDN (no images committed to
    // git). The backend (separate repo) will serve product media later — add its host here then.
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      ...(process.env.NEXT_PUBLIC_MEDIA_HOST
        ? [{ protocol: 'https' as const, hostname: process.env.NEXT_PUBLIC_MEDIA_HOST }]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);

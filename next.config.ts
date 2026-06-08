import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Product media will come from the backend / object storage (a separate repo/service).
    // Add the real media host here once chosen (e.g. R2 / S3 / UploadThing CDN).
    remotePatterns: process.env.NEXT_PUBLIC_MEDIA_HOST
      ? [{ protocol: 'https', hostname: process.env.NEXT_PUBLIC_MEDIA_HOST }]
      : [],
  },
};

export default withNextIntl(nextConfig);

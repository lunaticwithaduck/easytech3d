import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { fontVariables } from '@/app/fonts';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CartHydrator } from '@/components/layout/CartHydrator';
import { Footer } from '@/components/layout/Footer/Footer';
import { Header } from '@/components/layout/Header/Header';
import { JsonLd } from '@/components/util/JsonLd';
import { shop } from '@/data/settings';
import { routing } from '@/i18n/routing';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  organizationLd,
  SITE_NAME,
  SITE_URL,
  websiteLd,
} from '@/lib/seo';

// Root chrome: skip-link → announcement-bar → header → main → footer → cart-drawer.
// <html>/<body> live here (next-intl pattern). Styling is 100% the design system (globals.css +
// the @/design-system primitives) — there is no theme CSS anymore.

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Site-wide metadata defaults. metadataBase resolves relative OG/canonical URLs; the title
// template appends the brand to every page's bare title. Per-page metadata overrides the rest.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} – Филаменти и части за 3D печат`,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    manifest: '/manifest.webmanifest',
    icons: { icon: shop.logo },
    formatDetection: { telephone: false },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: locale === 'en' ? 'en_US' : 'bg_BG',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: '#ff1b5c',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  // NOTE: do NOT read cookies here (no getCart/getCurrentCustomer). The cart count and
  // account state hydrate client-side (CartHydrator / AccountLink) so this shared layout
  // stays statically rendered and the catalog pages keep their ISR.

  return (
    <html className={`js ${fontVariables}`} lang={locale}>
      {/* overflow-x-hidden clips the off-canvas drawers/submenus (translate-x-full) so they don't
          create horizontal scroll on mobile. */}
      <body className="overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          <JsonLd data={[organizationLd(), websiteLd(locale)]} />
          <a className="sr-only focus:not-sr-only" href="#MainContent">
            Прескочи към съдържанието
          </a>

          <AnnouncementBar />
          <Header />

          <main id="MainContent" tabIndex={-1}>
            {children}
          </main>

          <Footer />
          <CartHydrator />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

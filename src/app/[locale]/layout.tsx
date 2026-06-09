import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/app/fonts';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';

// Root chrome — a 1:1 translation of layout/theme.liquid <body>:
//   skip-link → announcement-bar → header → #PageContainer( main + footer ) → cart-drawer.
// <html>/<body> live here (next-intl pattern); the real theme CSS (globals.css) styles every class.

// Load order mirrors layout/theme.liquid: computed :root → flickity → core → theme, then the
// page-scoped sheets. Served from /public/theme/.
const THEME_STYLESHEETS = [
  '/theme/variables-root.css',
  '/theme/flickity.min.css',
  '/theme/core.css',
  '/theme/theme.css',
  '/theme/component-rating.css',
  '/theme/collection-page.css',
  '/theme/cart-page.css',
  // Static-port adaptations (loaded LAST so it overrides theme.css): behaviour the
  // live theme got from Flickity / Shopify section inline <style> that we don't run.
  '/theme/port-overrides.css',
];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  return (
    <html className={`js ${fontVariables}`} lang={locale}>
      <body>
        {/* The live Shopify theme's own CSS, loaded via <link> (browser-parsed) like the real site.
            React hoists these to <head> with a shared precedence so order + render-blocking hold. */}
        {THEME_STYLESHEETS.map((href) => (
          <link key={href} rel="stylesheet" href={href} precedence="theme" />
        ))}

        <NextIntlClientProvider messages={messages}>
          <a className="in-page-link visually-hidden skip-link" href="#MainContent">
            Прескочи към съдържанието
          </a>

          <AnnouncementBar />
          <Header />

          <div className="page-container drawer-page-content" id="PageContainer">
            <main className="main-content js-focus-hidden" id="MainContent" role="main" tabIndex={-1}>
              {children}
            </main>

            <Footer />
          </div>

          <div className="mobile_menu_overlay" />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

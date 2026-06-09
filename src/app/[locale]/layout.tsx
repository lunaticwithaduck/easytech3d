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

// The live theme CSS, pulled in via a single loader that places it all in a low-priority cascade
// LAYER (see public/theme/backstop.css). This keeps it as a backstop for un-migrated surfaces while
// guaranteeing the design-system utilities (unlayered) win on migrated markup.
const THEME_STYLESHEETS = ['/theme/backstop.css'];

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

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

// Root chrome: skip-link → announcement-bar → header → main → footer → cart-drawer.
// <html>/<body> live here (next-intl pattern). Styling is 100% the design system (globals.css +
// the @/design-system primitives) — there is no theme CSS anymore.

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
        <NextIntlClientProvider messages={messages}>
          <a className="sr-only focus:not-sr-only" href="#MainContent">
            Прескочи към съдържанието
          </a>

          <AnnouncementBar />
          <Header />

          <main id="MainContent" role="main" tabIndex={-1}>
            {children}
          </main>

          <Footer />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

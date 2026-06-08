import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { AnnouncementBar } from '@/features/chrome/AnnouncementBar/AnnouncementBar';
import { Footer } from '@/features/chrome/Footer/Footer';
import { Header } from '@/features/chrome/Header/Header';
import { routing } from '@/i18n/routing';
import { getFooterMenu, getMenu } from '@/server/catalog/data';
import { fontVariables } from '../fonts';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AnnouncementBar message="Безплатна доставка при поръчки над 100 лв. · Изпращаме в същия ден" />
          <Header menu={getMenu()} />
          {children}
          <Footer menu={getFooterMenu()} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

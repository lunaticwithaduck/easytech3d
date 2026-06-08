import { setRequestLocale } from 'next-intl/server';
import { ContactPage } from '@/features/page/components/ContactPage/ContactPage';
import { getPageContent } from '@/features/page/config/constants';
import { PageContent } from '@/features/page/PageContent';
import { resolvePageTitle } from '@/features/page/utils/page.utils';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function StaticPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (slug === 'contact') {
    return <ContactPage />;
  }

  return <PageContent title={resolvePageTitle(slug)} contentHtml={getPageContent(slug)} />;
}

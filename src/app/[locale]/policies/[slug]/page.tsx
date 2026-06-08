import { setRequestLocale } from 'next-intl/server';
import { PageContent } from '@/features/page/PageContent';
import { resolvePolicyTitle } from '@/features/page/utils/page.utils';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function PolicyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return <PageContent title={resolvePolicyTitle(slug)} />;
}

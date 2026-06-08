import { setRequestLocale } from 'next-intl/server';
import { getPolicyContent } from '@/features/page/config/constants';
import { PageContent } from '@/features/page/PageContent';
import { resolvePolicyTitle } from '@/features/page/utils/page.utils';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function PolicyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const title = resolvePolicyTitle(slug);

  // Policies reuse the generic page layout (`main-page` markup): banner-less page header + RTE body.
  return <PageContent title={title} contentHtml={getPolicyContent(title)} />;
}

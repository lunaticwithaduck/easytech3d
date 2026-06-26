// Locale-scoped 404. Next.js renders this inside [locale]/layout.tsx which already calls
// setRequestLocale and provides the NextIntlClientProvider, so locale context is available.
// not-found files do not receive route params.
//
// BodyClass sets `body.template-404` client-side so theme CSS rules keyed on that class apply.

import type { Metadata } from 'next';
import { Page404 } from '@/components/templates/Page404';
import { BodyClass } from '@/components/util/BodyClass';

export const metadata: Metadata = {
  title: 'Страница 404',
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return (
    <>
      <BodyClass name="template-404" />
      <Page404 />
    </>
  );
}

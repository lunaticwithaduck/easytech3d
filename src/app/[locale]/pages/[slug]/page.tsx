// Route: /[locale]/pages/[slug]
//
// Branches on slug:
//   "contact"                  → ContactTemplate (page header + rte body + contact form)
//   everything else            → PageTemplate    (page header + rte body)
//
// BG fixture content is provided for known slugs. Unknown slugs fall back to a generic title
// derived from the slug (replace hyphens with spaces, capitalise first letter).
//
// Renders <BodyClass name="template-page" /> so the theme's body.template-page CSS rules apply.

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PrintOnOrderTemplate } from '@/components/quote/PrintOnOrderTemplate';
import { ContactTemplate } from '@/components/templates/ContactTemplate';
import { PageTemplate } from '@/components/templates/PageTemplate';
import { BodyClass } from '@/components/util/BodyClass';
import { routes } from '@/config/routes';
import { CONTACT_CONTENT, getPageFixture, type PageFixture } from '@/data/pages';
import { buildMetadata, stripHtml } from '@/lib/seo';

// The 3D-print-on-order page renders the STL quote calculator (both the Latin route handle and the
// Cyrillic menu handle resolve here).
const PRINT_SLUGS = ['3d-print-on-order', '3d-принт-при-поръчка'];

// ── Route ────────────────────────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Cyrillic slugs (e.g. общи-условия) arrive URL-encoded — decode before lookup.
function fixtureFor(rawSlug: string): PageFixture {
  const slug = decodeURIComponent(rawSlug);
  if (slug === 'contact') return CONTACT_CONTENT;
  return getPageFixture(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const decoded = decodeURIComponent(slug);
  if (PRINT_SLUGS.includes(decoded)) {
    return buildMetadata({
      locale,
      path: routes.page(decoded),
      title: '3D Принт по поръчка',
      description:
        'Качете STL файл и получете моментална цена за 3D принт по поръчка. PLA, PETG, ABS, ASA. Доставка в цяла България.',
    });
  }
  const fixture = fixtureFor(slug);
  return buildMetadata({
    locale,
    path: routes.page(decoded),
    title: fixture.title,
    description: stripHtml(fixture.contentHtml),
  });
}

export default async function StaticPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const decoded = decodeURIComponent(slug);
  if (PRINT_SLUGS.includes(decoded)) {
    return (
      <>
        <BodyClass name="template-page" />
        <PrintOnOrderTemplate />
      </>
    );
  }

  if (decoded === 'contact') {
    return (
      <>
        <BodyClass name="template-page" />
        <ContactTemplate title={CONTACT_CONTENT.title} contentHtml={CONTACT_CONTENT.contentHtml} />
      </>
    );
  }

  const { title, contentHtml } = fixtureFor(slug);

  return (
    <>
      <BodyClass name="template-page" />
      <PageTemplate title={title} contentHtml={contentHtml} />
    </>
  );
}

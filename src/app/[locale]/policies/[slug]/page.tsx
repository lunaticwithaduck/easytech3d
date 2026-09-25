// Policy pages (privacy-policy, refund-policy, terms-of-service) — design-system surface.
// The live store renders these as a centered, padded narrow column with an 80px h1 and a .rte body;
// reproduced here with Container + Heading + Rte (prose). Representative BG body per slug; the full
// legal text lives in the live Shopify store.

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Rte } from '@/components/snippets/Rte';
import { routes } from '@/config/routes';
import { policyBody, policyTitle } from '@/data/policies';
import { Container, Heading } from '@/design-system';
import { buildMetadata, stripHtml } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildMetadata({
    locale,
    path: routes.policy(slug),
    title: policyTitle(slug),
    description: stripHtml(policyBody(slug)) || `${policyTitle(slug)} — EasyTech3D.`,
  });
}

export default async function PolicyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        <Heading as="h1" level={1} className="mb-8 text-center">
          {policyTitle(slug)}
        </Heading>
        <Rte html={policyBody(slug)} />
      </div>
    </Container>
  );
}

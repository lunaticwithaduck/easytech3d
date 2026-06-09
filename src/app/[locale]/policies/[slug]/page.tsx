// Policy pages (privacy-policy, refund-policy, terms-of-service) — design-system surface.
// The live store renders these as a centered, padded narrow column with an 80px h1 and a .rte body;
// reproduced here with Container + Heading + Rte (prose). Representative BG body per slug; the full
// legal text lives in the live Shopify store.

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Container, Heading } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function policyTitle(slug: string): string {
  switch (slug) {
    case 'privacy-policy':
      return 'Политика за поверителност';
    case 'refund-policy':
      return 'Политика за връщане';
    case 'terms-of-service':
      return 'Общи условия';
    default:
      return slug;
  }
}

function policyBody(slug: string): string {
  switch (slug) {
    case 'refund-policy':
      return '<p>Имаме 30-дневна политика за връщане, което означава, че имате 30 дни след получаването на продукта, за да поискате връщане. За повече информация се свържете с нас на <a href="mailto:easytech3dbg@gmail.com">easytech3dbg@gmail.com</a>.</p>';
    case 'privacy-policy':
      return '<p>Тази Политика за поверителност описва как easytech3d събира, използва и разкрива Вашата лична информация, когато посещавате нашия уебсайт или правите покупка. За въпроси се свържете с нас на <a href="mailto:easytech3dbg@gmail.com">easytech3dbg@gmail.com</a>.</p>';
    case 'terms-of-service':
      return '<p>Посещавайки нашия сайт и/или закупувайки нещо от нас, вие се включвате в нашата "Услуга" и се съгласявате да бъдете обвързани с настоящите Условия за ползване. За въпроси се свържете с нас на <a href="mailto:easytech3dbg@gmail.com">easytech3dbg@gmail.com</a>.</p>';
    default:
      return '';
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${policyTitle(slug)} – easytech3d` };
}

export default async function PolicyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto max-w-[693px]">
        <Heading as="h1" level={1} className="mb-8 text-center">
          {policyTitle(slug)}
        </Heading>
        <Rte html={policyBody(slug)} />
      </div>
    </Container>
  );
}

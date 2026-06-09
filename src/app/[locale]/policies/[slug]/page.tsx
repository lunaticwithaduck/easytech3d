// Policy pages — rendered by Shopify's built-in policy template.
//
// Ground truth markup (same for all three policy slugs):
//   tools/output/reference/mirror/policies/refund-policy/index.html lines 1566–1577
//
// The Shopify policy template renders:
//   .shopify-policy__container
//     .shopify-policy__title > h1
//     .shopify-policy__body > .rte > <p>…</p>
//
// BodyClass sets body.template-policy so theme CSS rules on that class apply.
// Supported slugs: privacy-policy, refund-policy, terms-of-service.

import { setRequestLocale } from 'next-intl/server';
import { BodyClass } from '@/components/util/BodyClass';
import { Rte } from '@/components/snippets/Rte';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// BG title per slug (per the assignment brief and per the live footer links).
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

// Short BG summary body per slug. The full policy text lives in the live Shopify store;
// this provides a representative placeholder that is correct for the static build.
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

export default async function PolicyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const title = policyTitle(slug);
  const bodyHtml = policyBody(slug);

  return (
    <>
      <BodyClass name="template-policy" />
      <div className="shopify-policy__container">
        <div className="shopify-policy__title">
          <h1>{title}</h1>
        </div>
        <div className="shopify-policy__body">
          <Rte html={bodyHtml} />
        </div>
      </div>
    </>
  );
}

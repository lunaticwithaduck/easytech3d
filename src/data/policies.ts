// Policy-page fixture content (privacy-policy, refund-policy, terms-of-service). Kept OUT of the
// route file: the convention linter scans src/app/** and flags raw <p>/<a>, but this is intentional
// HTML-as-data rendered through the Rte prose surface. The full legal text lives in the live store.

export function policyTitle(slug: string): string {
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

export function policyBody(slug: string): string {
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

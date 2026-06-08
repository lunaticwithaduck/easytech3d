import { routes } from '@/config/routes';

// Short brand blurb shown beside the wordmark (mirrors the live footer's "text" block copy).
export const FOOTER_BLURB =
  'Точните консумативи и резервни части за Вашия 3D принтер — филаменти, резини и аксесоари на достъпни цени.';

export const FOOTER_WORDMARK = 'EasyTech3D';

export const FOOTER_COPYRIGHT = '© EasyTech3D';

// Newsletter block copy (matches homeConfig.newsletter on the live storefront).
export const FOOTER_NEWSLETTER_TITLE = 'Абонирайте се към нашият мейл лист';
export const FOOTER_NEWSLETTER_TEXT =
  'Получавайте известия за промоции, нови продукти и развития в света на 3D принтинга.';
export const FOOTER_NEWSLETTER_PLACEHOLDER = 'Вашият имейл адрес';
export const FOOTER_NEWSLETTER_CTA = 'Абониране';

// Bottom-bar policy links. Hrefs come from the typed route table (R7).
export const FOOTER_POLICY_LINKS: { label: string; href: string }[] = [
  { label: 'Политика за поверителност', href: routes.policy('privacy-policy') },
  { label: 'Политика за връщане', href: routes.policy('refund-policy') },
  { label: 'Общи условия', href: routes.policy('terms-of-service') },
];

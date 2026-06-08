import type { IconName } from '@/design-system/icons';

// Footer block titles — EXACT live copy from `settings_data.json` footer blocks (config-copy §1.10):
//   text block  → "Последвайте ни" (Follow us), social icons on
//   link_list   → "Бързи Линкове" (Quick Links), menu handle `footer`
//   text block  → copyright "all rights reserved @ easytech3d" (lowercase as written)
export const FOOTER_SOCIAL_TITLE = 'Последвайте ни';
export const FOOTER_QUICK_LINKS_TITLE = 'Бързи Линкове';
export const FOOTER_COPYRIGHT = 'all rights reserved @ easytech3d';

// Social icons — active socials are Twitter / Facebook / Pinterest only (config-copy §1.7).
// Order matches the live render (Facebook, Twitter, Pinterest — see reference screenshot
// 09-footer-sitefooter.png). Links are `#` placeholders this session; the real URLs are
// https://www.facebook.com/easytech3d, https://twitter.com/easytech3d, https://www.pinterest.com/easytech3d/.
export const FOOTER_SOCIAL_LINKS: { name: string; icon: IconName; href: string }[] = [
  { name: 'Facebook', icon: 'facebook', href: '#' },
  { name: 'Twitter', icon: 'twitter', href: '#' },
  { name: 'Pinterest', icon: 'pinterest', href: '#' },
];

// Newsletter block copy (optional; the live home newsletter section uses this copy). The footer's
// newsletter block is disabled on the live store, so this is rendered only when explicitly enabled.
export const FOOTER_NEWSLETTER_TITLE = 'Абонирайте се към нашият мейл лист';
export const FOOTER_NEWSLETTER_TEXT =
  'Получавайте известия за промоции, нови продукти и развития в света на 3D принтинга.';
export const FOOTER_NEWSLETTER_PLACEHOLDER = 'Имейл';
export const FOOTER_NEWSLETTER_CONFIRMATION = 'Благодарим за абонирането!';

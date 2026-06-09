import type { MenuLink } from '@/lib/shopify/types';

// Storefront menus (Shopify `linklists`). The theme setting `main_linklist` is empty, so the live
// nav comes from the store's default "main-menu" — which lives only in the rendered site, not in
// the theme files. The values below were reconciled VERBATIM against the captured mirror header
// (tools/output/reference/mirror/index.html): exact labels, ordering, nesting, and hrefs.
// Cyrillic hrefs are stored decoded (the locale-aware Link re-encodes as needed).

export const mainMenu: MenuLink[] = [
  { title: 'Начало', url: '/' },
  { title: 'Всички категории', url: '/collections' },
  {
    title: 'Филаменти',
    url: '/collections/all-filaments',
    links: [
      {
        title: 'PLA',
        url: '/collections/pla-filaments',
        links: [
          { title: 'Nature3D', url: '/collections/nature3d' },
          { title: 'RE3D', url: '/collections/re3d' },
          { title: '3DLine', url: '/collections/3dline-pla-filaments' },
          { title: 'Elegoo', url: '/search?q=Elegoo*%20AND%20product_type:*&type=product' },
          { title: 'Всички', url: '/collections/pla-filaments' },
        ],
      },
      { title: 'PETG', url: '/collections/petg' },
      { title: 'PLA Pro', url: '/collections/pla-pro-filaments' },
      { title: 'PLA Flex', url: '/collections/pla-flex' },
      { title: 'ABS', url: '/collections/abs' },
      { title: 'ASA', url: '/collections/asa' },
      { title: 'HiTPLA', url: '/collections/hitpla-филаменти' },
      { title: 'UltraHiTPLA', url: '/collections/ultrahitpla-filaments' },
    ],
  },
  { title: 'Резини', url: '/collections/resins' },
  { title: 'Части', url: '/collections/3d-printer-parts' },
  { title: 'Контакт', url: '/pages/contact' },
  { title: '3D принт при поръчка', url: '/pages/3d-принт-при-поръчка' },
];

// "Бързи Линкове" — policy links from the live footer
// (tools/output/reference/mirror/index.html lines 12943–12960).
export const footerMenu: MenuLink[] = [
  { title: 'Поверителност', url: '/policies/privacy-policy' },
  { title: 'Условия за ползване', url: '/policies/terms-of-service' },
  { title: 'Refund Policy', url: '/policies/refund-policy' },
  { title: 'Sitemap', url: '/pages/sitemap' },
];

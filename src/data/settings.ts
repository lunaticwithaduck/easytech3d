// Theme settings — transcribed from config/settings_data.json (`current`). These are the values
// the chrome sections (announcement-bar, header, footer) read from `settings.*` / `section.settings.*`.

const FILES = 'https://cdn.shopify.com/s/files/1/0726/9413/7129/files';

export const shop = {
  name: 'EasyTech3D',
  /** logo setting: shopify://shop_images/logo.jpg */
  logo: `${FILES}/logo.jpg`,
  logoMaxWidth: 100,
} as const;

export const announcementBar = {
  enabled: true,
  background: '#fd5b2a',
  textColor: '#ffffff',
  showArrows: true,
  autoplay: true,
  cycleSpeed: 4,
  blocks: [
    {
      contentHtml:
        '<p><strong>Безплатна </strong>доставка за поръчки над <strong>150лв</strong>!</p>',
      link: '',
    },
    {
      contentHtml:
        '<p><strong>EasyTech3d </strong> -<em><strong> Партньор във Вашия Творчески Свят</strong></em></p>',
      link: '',
    },
  ],
} as const;

export const header = {
  alignLogo: 'inline',
  logoMaxWidth: 100,
  mainLinklistStyle: 'uppercase' as const,
  showLocaleSelector: true,
  showSearchFilter: true,
  enableLiveSearch: true,
  searchPopularProductsCollection: 'pla-flex',
} as const;

export const footer = {
  bg: '#000000',
  headings: '#ffffff',
  text: '#ebebeb',
  links: '#cccccc',
  linksHover: 'rgba(0,0,0,0)',
  blocks: {
    social: { title: 'Последвайте ни', showSocialIcons: true },
    linkList: { title: 'Бързи Линкове', menu: 'footer' },
    copyright: { title: 'all rights reserved @ easytech3d' },
  },
} as const;

export const social = {
  twitter: 'https://twitter.com/easytech3d',
  facebook: 'https://www.facebook.com/easytech3d',
  pinterest: 'https://www.pinterest.com/easytech3d/',
  instagram: '',
} as const;

// Storefront behaviour flags the product/collection markup branches on.
export const flags = {
  showColorSwatch: true,
  showAddToCartBtn: true,
  showQuickView: true,
  showPreOrderBtn: true,
  showSecondImageOnHover: true,
  showReviewsBadge: true,
  showDiscount: true,
  discountMode: 'percentage' as const,
  alignHeight: true,
  collectionHeight: 200,
  cartIconStyle: 'cart' as const,
  freeShippingThreshold: 105, // BGN (settings: cart_free_shipping_threshold "105")
} as const;

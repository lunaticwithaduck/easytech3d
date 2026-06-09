// Home composition — a faithful transcription of templates/index.json (the OS 2.0 home template).
// Each entry mirrors a section + its block settings exactly: BG copy, collection handles, overlay
// colours/opacities, icon names, section order. Disabled sections (2nd slideshow, logo-bar) and the
// SEO-breadcrumb app block are omitted, matching what the live home renders.

export interface HomeSlide {
  title: string;
  subheading: string;
  buttonLabel: string;
  buttonLink: string;
  image: string; // CDN path under the store files
  colorOverlay: string;
  overlayOpacity: number; // 0–100
  textColor: string;
  textAlignment: string; // e.g. "left center"
}

export interface FeaturedTab {
  heading: string;
  collectionHandle: string;
  maxProducts: number;
}

export interface FeaturedProductsSection {
  title: string;
  subtitle: string;
  navigationStyle: 'large' | 'normal';
  grid: number;
  tabs: FeaturedTab[];
}

const CDN = 'https://cdn.shopify.com/s/files/1/0726/9413/7129/files';

export const homeSlides: HomeSlide[] = [
  {
    title: 'Nature3D',
    subheading: 'Изключително качествен PLA на вече изключително достъпни цени',
    buttonLabel: 'Яко, заведи ме!',
    buttonLink: '/collections/nature3d',
    image: `${CDN}/3DPRINTING_wall-tiles_1920x1080-1920x1080.jpg`,
    colorOverlay: '#000',
    overlayOpacity: 55,
    textColor: '#ffffff',
    textAlignment: 'left center',
  },
  {
    title: 'RE3D',
    subheading: 'Точните консумативи за Вашия 3D принтер са вече налични в EasyTech3D',
    buttonLabel: 'Купете сега',
    buttonLink: '/collections/re3d',
    image: `${CDN}/baner_sait.jpg`,
    colorOverlay: '#000000',
    overlayOpacity: 40,
    textColor: '#ffffff',
    textAlignment: 'left center',
  },
  {
    title: 'EasyTech3D',
    subheading: 'Най-качествената 3D нишка за вашите най-смели проекти',
    buttonLabel: 'Всички колекции',
    buttonLink: '/collections',
    image: `${CDN}/baner_2.webp`,
    colorOverlay: '#000000',
    overlayOpacity: 60,
    textColor: '#ffffff',
    textAlignment: 'left bottom',
  },
];

export const slideshowSettings = {
  width: 'full',
  height: 'small',
  mobileHeight: 'medium',
  textSize: 'large',
  showButtons: true,
  showDots: true,
  autorotate: true,
  autorotateSpeed: 6,
  // index.json custom_css: hide the slideshow under 750px.
  hideOnMobile: true,
} as const;

export const featuredProductsSections: FeaturedProductsSection[] = [
  {
    title: 'Филаменти за 3D принтер',
    subtitle: 'Най-Популярни',
    navigationStyle: 'large',
    grid: 4,
    tabs: [
      { heading: 'PLA Pro Филамент', collectionHandle: 'pla-pro-filaments', maxProducts: 10 },
      { heading: 'PLA Филамент', collectionHandle: 'pla-filaments', maxProducts: 10 },
      { heading: 'PETG Филамент', collectionHandle: 'petg', maxProducts: 10 },
    ],
  },
  {
    title: 'Филаменти за 3D принтер',
    subtitle: 'за истински ентусиасти',
    navigationStyle: 'normal',
    grid: 4,
    tabs: [
      { heading: 'PLA Flex', collectionHandle: 'pla-flex', maxProducts: 10 },
      { heading: 'ABS', collectionHandle: 'abs', maxProducts: 10 },
      { heading: 'ASA', collectionHandle: 'asa', maxProducts: 10 },
    ],
  },
  {
    title: 'Резервни части за 3D принтери',
    subtitle: '3д принтери',
    navigationStyle: 'large',
    grid: 4,
    tabs: [
      { heading: 'Дюзи', collectionHandle: 'nozzles', maxProducts: 5 },
      { heading: 'Легла', collectionHandle: '3d-printer-beds', maxProducts: 10 },
      { heading: 'BL Тъчове', collectionHandle: 'bl-touches', maxProducts: 10 },
    ],
  },
];

export const collectionListSection = {
  title: 'Всички Категории',
  subtitle: '',
  buttonText: 'Вижте категориите',
  link: '/collections',
  grid: 5,
  imageStyle: 'circle' as const,
  imageOverlay: '#000000',
  imageOverlayOpacity: 82,
  collectionHandles: ['nozzles', 'pla-flex', 'pla-pro-filaments', 'pla-filaments', 'petg', 'abs', 'asa'],
};

export const iconsWithTextSection = {
  title: 'Защо да купувате от нас?',
  subtitle: 'от ентусиасти за ентусиасти',
  iconColor: 'rgba(0,0,0,0)',
  blocks: [
    { icon: 'money-check', title: 'Ниски Цени', contentHtml: '<p>Целим се да направим 3Д принтирането по достъпно за българската общност</p>' },
    { icon: 'truck', title: 'Бързи Доставки', contentHtml: '<p>Поръчките се изпращат на същия ден, за да можете възможно най-скоро да се завърнете към проектите си</p>' },
    { icon: 'envelope', title: 'Поддръжка', contentHtml: '<p>Ако имате въпроси относно нашите продукти и използването им, свържете се с нас чрез формата за контакти с какъвто и да е въпрос.</p>' },
  ],
};

export const featuredBlogSection = {
  title: 'Проверете нашият блог',
  subtitle: 'ако се интересувате от развития в принт светът',
  blogHandle: '3д-принтове',
  postLimit: 4,
  postsPerRow: 4,
  showAuthor: true,
  showDate: true,
};

export const newsletterSection = {
  title: 'Абонирайте се към нашият мейл лист',
  subtitle: '',
  subheadingHtml: '<p>Получавайте известия за промоции, нови продукти, евенти, развития в 3D принтинг светът и други</p>',
};

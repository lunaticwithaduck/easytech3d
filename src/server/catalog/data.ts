import type {
  Article,
  Collection,
  NavItem,
  Product,
  ProductCardData,
  SortKey,
} from './types';

/**
 * MOCK catalog — stands in for the backend (separate repo) so the storefront renders 1:1 today.
 * Content (collection names, nav, home composition, copy) is faithful to the live theme's
 * index.json + BG locale. Imagery loads from Shopify's public CDN (nothing committed to git);
 * product images cycle a real photo pool until the backend serves exact media.
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0726/9413/7129';
const img = (path: string, alt: string, w = 960, h = 960) => ({ url: `${CDN}${path}`, alt, width: w, height: h });

// Real photo pool (banners + article images) used as stand-in product/category imagery.
const PHOTOS = [
  '/files/baner_2.webp',
  '/files/baner_sait.jpg',
  '/files/3DPRINTING_wall-tiles_1920x1080-1920x1080.jpg',
  '/articles/3d-printer.jpg',
  '/articles/hitpla.webp',
  '/articles/Greenboy3D-hero.jpg',
  '/articles/woodman.jpg',
  '/articles/rlp-cover-1.jpg',
  '/articles/3dprintinghobby.webp',
  '/articles/1280X1280-E3D-Bambu.jpg',
  '/articles/producto-dimalt_1.jpg',
  '/articles/Bolt-iz-ABS-plastika-na-3D-printere.jpg',
];
const photo = (i: number) => PHOTOS[i % PHOTOS.length];

// ---- Collections (real handles + BG titles, per the theme) -----------------------------------

type CollectionSeed = { handle: string; title: string };
const COLLECTION_SEEDS: CollectionSeed[] = [
  { handle: 'pla-filaments', title: 'PLA Филамент' },
  { handle: 'pla-pro-filaments', title: 'PLA Pro Филамент' },
  { handle: 'petg', title: 'PETG Филамент' },
  { handle: 'pla-flex', title: 'PLA Flex' },
  { handle: 'abs', title: 'ABS' },
  { handle: 'asa', title: 'ASA' },
  { handle: 'hitpla-filaments', title: 'HiTPLA Филамент' },
  { handle: 'ultrahitpla-filaments', title: 'UltraHiTPLA Филамент' },
  { handle: 'pla-aromatic', title: 'PLA Ароматен' },
  { handle: 'nature3d', title: 'Nature3D' },
  { handle: 're3d', title: 'RE3D' },
  { handle: '3dline-pla-filaments', title: '3DLine PLA' },
  { handle: 'all-filaments', title: 'Всички Филаменти' },
  { handle: 'resins', title: 'Резини' },
  { handle: 'nozzles', title: 'Дюзи' },
  { handle: '3d-printer-beds', title: 'Легла' },
  { handle: 'bl-touches', title: 'BL Тъчове' },
  { handle: 'clamps', title: 'Щипки' },
  { handle: '3d-printer-parts', title: 'Части за 3D принтер' },
  { handle: 'nature3d-abs', title: 'Nature3D ABS' },
  { handle: '3д-принтери', title: '3D Принтери' },
];

const collections: Collection[] = COLLECTION_SEEDS.map((c, i) => ({
  id: `col-${i + 1}`,
  handle: c.handle,
  title: c.title,
  descriptionHtml: `<p>Разгледайте нашата селекция ${c.title.toLowerCase()} — качествени консумативи и части за вашия 3D принтер на достъпни цени.</p>`,
  image: img(photo(i), c.title),
  productCount: 0, // filled after products
}));

// ---- Products (representative, BG names + BGN prices, generated per collection) ---------------

const COLORS = ['Черен', 'Бял', 'Червен', 'Син', 'Жълт', 'Зелен', 'Оранжев', 'Сив'];
const WEIGHTS = ['1kg', '0.5kg'];
let pid = 0;
let imgCursor = 0;

function makeProduct(collectionHandle: string, brand: string, base: string, basePrice: number): Product {
  pid += 1;
  const handle = `${brand}-${base}-${pid}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const onSale = pid % 4 === 0;
  const price = { amount: basePrice, currencyCode: 'BGN' as const };
  const compareAt = onSale ? { amount: Math.round((basePrice * 1.25) * 100) / 100, currencyCode: 'BGN' as const } : null;
  const images = [img(photo(imgCursor++), `${brand} ${base}`), img(photo(imgCursor++), `${brand} ${base}`)];
  const colorOpt = COLORS.slice(0, 4);
  const variants = colorOpt.flatMap((color) =>
    WEIGHTS.map((w) => ({
      id: `v-${pid}-${color}-${w}`,
      title: `${color} / ${w}`,
      available: true,
      price,
      compareAtPrice: compareAt,
      selectedOptions: { Цвят: color, Тегло: w },
      sku: `${handle}-${color}-${w}`.toUpperCase(),
    })),
  );
  return {
    id: `prod-${pid}`,
    handle,
    title: `${brand} ${base}`,
    vendor: brand,
    descriptionHtml: `<p>${brand} ${base} — висококачествен консуматив за 3D печат с отлична адхезия и стабилни резултати. Подходящ за широка гама от проекти.</p><ul><li>Диаметър: 1.75mm</li><li>Толеранс: ±0.02mm</li><li>Препоръчителна температура: 200–220°C</li></ul>`,
    featuredImage: images[0],
    images,
    options: [
      { name: 'Цвят', values: colorOpt },
      { name: 'Тегло', values: WEIGHTS },
    ],
    variants,
    priceRange: { min: price, max: price },
    available: true,
    onSale,
    collections: [collectionHandle],
    tags: [brand, base],
  };
}

const PRODUCT_PLAN: Array<{ handle: string; brand: string; bases: string[]; price: number }> = [
  { handle: 'pla-filaments', brand: '3DLine', bases: ['PLA', 'PLA Silk', 'PLA Matte', 'PLA Galaxy', 'PLA Marble', 'PLA Wood'], price: 24.9 },
  { handle: 'pla-pro-filaments', brand: 'Nature3D', bases: ['PLA Pro', 'PLA Pro Silk', 'PLA Pro Tough', 'PLA Pro Matte'], price: 28.9 },
  { handle: 'petg', brand: '3DLine', bases: ['PETG', 'PETG Transparent', 'PETG CF', 'PETG Pro'], price: 27.9 },
  { handle: 'pla-flex', brand: 'Nature3D', bases: ['PLA Flex', 'TPU 95A', 'TPU 85A'], price: 32.9 },
  { handle: 'abs', brand: 'Nature3D', bases: ['ABS', 'ABS Pro', 'ABS+'], price: 26.9 },
  { handle: 'asa', brand: 'Nature3D', bases: ['ASA', 'ASA CF'], price: 29.9 },
  { handle: 'nozzles', brand: 'Creativity', bases: ['Месингова дюза 0.4mm', 'Закалена дюза 0.4mm', 'Дюза 0.6mm'], price: 7.9 },
  { handle: '3d-printer-beds', brand: 'Creativity', bases: ['Магнитна плоча 235x235', 'PEI плоча 310x310', 'Стъклена плоча'], price: 19.9 },
  { handle: 'bl-touches', brand: 'Creativity', bases: ['BL Touch сензор', 'Резервни игли BL Touch'], price: 39.9 },
];

const products: Product[] = PRODUCT_PLAN.flatMap((p) =>
  p.bases.map((base) => makeProduct(p.handle, p.brand, base, p.price)),
);

// Backfill product counts.
for (const c of collections) {
  c.productCount = products.filter((p) => p.collections.includes(c.handle)).length || 12;
}

const toCard = (p: Product): ProductCardData => ({
  id: p.id,
  handle: p.handle,
  title: p.title,
  featuredImage: p.featuredImage,
  price: p.priceRange.min,
  compareAtPrice: p.onSale ? { amount: Math.round(p.priceRange.min.amount * 1.25 * 100) / 100, currencyCode: 'BGN' } : null,
  available: p.available,
  onSale: p.onSale,
  vendor: p.vendor,
});

// ---- Articles (real BG titles from the blog) -------------------------------------------------

const BLOG = '3д-принтове';
const ARTICLE_SEEDS: Array<{ handle: string; title: string; image: string }> = [
  { handle: 'pla-срещу-pla-филамент', title: 'PLA срещу PLA+ филамент', image: '/articles/hitpla.webp' },
  { handle: 'революцията-на-3d-принтера', title: 'Революцията на 3D принтера', image: '/articles/3d-printer.jpg' },
  { handle: '3d-принтиране-за-новонавлизащи', title: '3D принтиране за новонавлизащи', image: '/articles/3dprintinghobby.webp' },
  { handle: 'типове-3d-принтери', title: 'Типове 3D принтери', image: '/articles/Cover-3dprinters-0407.jpg' },
  { handle: '3dline-hitpla', title: '3DLine HiTPLA — най-добрата нишка за вашия проект', image: '/articles/hitpla.webp' },
  { handle: 'бъдещето-на-производството-rlp', title: 'Бъдещето на производството с технологията RLP', image: '/articles/rlp-cover-1.jpg' },
  { handle: 'партньорство-e3d-bambu-lab', title: 'Партньорство между E3D и Bambu Lab', image: '/articles/1280X1280-E3D-Bambu.jpg' },
  { handle: 'dimafix-спрей', title: 'DimaFix спрей за по-добро залепване', image: '/articles/producto-dimalt_1.jpg' },
  { handle: 'greenboys-extruder', title: 'GreenBoy3D екструдер', image: '/articles/Greenboy3D-hero.jpg' },
  { handle: '3d-printers-5-models', title: '5 модела 3D принтери', image: '/articles/woodman.jpg' },
];

const articles: Article[] = ARTICLE_SEEDS.map((a, i) => ({
  id: `art-${i + 1}`,
  handle: a.handle,
  blogHandle: BLOG,
  title: a.title,
  excerpt: 'Прочетете повече за последните развития и съвети в света на 3D печата от екипа на EasyTech3D.',
  contentHtml: `<p>${a.title}. Това е примерно съдържание на статия, което ще бъде заменено от реалния бекенд.</p>`,
  image: img(a.image, a.title, 720, 480),
  author: 'EasyTech3D',
  publishedAt: `2024-0${(i % 9) + 1}-15T10:00:00.000Z`,
}));

// ---- Navigation ------------------------------------------------------------------------------

const menu: NavItem[] = [
  { label: 'Начало', href: '/' },
  { label: 'Всички категории', href: '/collections' },
  {
    label: 'Филаменти',
    href: '/collections/all-filaments',
    children: [
      { label: 'PLA', href: '/collections/pla-filaments' },
      { label: 'PLA Pro', href: '/collections/pla-pro-filaments' },
      { label: 'PLA Flex', href: '/collections/pla-flex' },
      { label: 'PETG', href: '/collections/petg' },
      { label: 'ABS', href: '/collections/abs' },
      { label: 'ASA', href: '/collections/asa' },
      { label: 'HiTPLA', href: '/collections/hitpla-filaments' },
      { label: 'Nature3D', href: '/collections/nature3d' },
      { label: 'RE3D', href: '/collections/re3d' },
      { label: '3DLine', href: '/collections/3dline-pla-filaments' },
    ],
  },
  { label: 'Резини', href: '/collections/resins' },
  {
    label: 'Части',
    href: '/collections/3d-printer-parts',
    children: [
      { label: 'Дюзи', href: '/collections/nozzles' },
      { label: 'Легла', href: '/collections/3d-printer-beds' },
      { label: 'BL Тъчове', href: '/collections/bl-touches' },
    ],
  },
  { label: 'Блог', href: '/blogs/3д-принтове' },
  { label: '3D Print на поръчка', href: '/pages/3d-принт-при-поръчка' },
  { label: 'Контакти', href: '/pages/contact' },
];

const footerMenu: NavItem[] = [
  {
    label: 'Магазин',
    href: '/collections',
    children: [
      { label: 'Всички филаменти', href: '/collections/all-filaments' },
      { label: 'Части', href: '/collections/3d-printer-parts' },
      { label: 'Резини', href: '/collections/resins' },
      { label: '3D Print на поръчка', href: '/pages/3d-принт-при-поръчка' },
    ],
  },
  {
    label: 'Информация',
    href: '/pages/contact',
    children: [
      { label: 'Контакти', href: '/pages/contact' },
      { label: 'Блог', href: '/blogs/3д-принтове' },
      { label: 'Общи условия', href: '/pages/общи-условия' },
      { label: 'Политика за поверителност', href: '/policies/privacy-policy' },
      { label: 'Политика за връщане', href: '/policies/refund-policy' },
    ],
  },
];

// ---- Home composition (faithful to templates/index.json) -------------------------------------

export const homeConfig = {
  slides: [
    {
      title: 'Nature3D',
      subheading: 'Изключително качествен PLA на вече изключително достъпни цени',
      ctaLabel: 'Яко, заведи ме!',
      ctaHref: '/collections/nature3d',
      image: img('/files/3DPRINTING_wall-tiles_1920x1080-1920x1080.jpg', 'Nature3D', 1920, 1080),
      align: 'left center' as const,
    },
    {
      title: 'RE3D',
      subheading: 'Точните консумативи за Вашия 3D принтер са вече налични в EasyTech3D',
      ctaLabel: 'Купете сега',
      ctaHref: '/collections/re3d',
      image: img('/files/baner_sait.jpg', 'RE3D', 1920, 1080),
      align: 'left center' as const,
    },
    {
      title: 'EasyTech3D',
      subheading: 'Най-качествената 3D нишка за вашите най-смели проекти',
      ctaLabel: 'Всички колекции',
      ctaHref: '/collections',
      image: img('/files/baner_2.webp', 'EasyTech3D', 1920, 1080),
      align: 'left bottom' as const,
    },
  ],
  featuredGroups: [
    { title: 'Филаменти за 3D принтер', subtitle: 'Най-Популярни', collectionHandles: ['pla-pro-filaments', 'pla-filaments', 'petg'] },
    { title: 'Филаменти за 3D принтер', subtitle: 'за истински ентусиасти', collectionHandles: ['pla-flex', 'abs', 'asa'] },
    { title: 'Резервни части за 3D принтери', subtitle: '3д принтери', collectionHandles: ['nozzles', '3d-printer-beds', 'bl-touches'] },
  ],
  categoryShowcase: {
    title: 'Всички Категории',
    ctaLabel: 'Вижте категориите',
    ctaHref: '/collections',
    collectionHandles: ['nozzles', 'pla-flex', 'pla-pro-filaments', 'pla-filaments', 'petg', 'abs', 'asa'],
  },
  features: {
    title: 'Защо да купувате от нас?',
    subtitle: 'от ентусиасти за ентусиасти',
    items: [
      { icon: 'badge-dollar-sign', title: 'Ниски Цени', content: 'Целим се да направим 3D принтирането по-достъпно за българската общност.' },
      { icon: 'truck', title: 'Бързи Доставки', content: 'Поръчките се изпращат на същия ден, за да можете възможно най-скоро да се завърнете към проектите си.' },
      { icon: 'mail', title: 'Поддръжка', content: 'Ако имате въпроси относно нашите продукти и използването им, свържете се с нас чрез формата за контакти.' },
    ],
  },
  blog: { title: 'Проверете нашият блог', subtitle: 'ако се интересувате от развития в принт светът', blogHandle: BLOG },
  newsletter: {
    title: 'Абонирайте се към нашият мейл лист',
    subheading: 'Получавайте известия за промоции, нови продукти, евенти, развития в 3D принтинг светът и други.',
  },
} as const;

// ---- Accessors (the "API" the backend will mirror) -------------------------------------------

const sorters: Record<SortKey, (a: ProductCardData, b: ProductCardData) => number> = {
  manual: () => 0,
  'best-selling': () => 0,
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'price-asc': (a, b) => a.price.amount - b.price.amount,
  'price-desc': (a, b) => b.price.amount - a.price.amount,
  'created-desc': () => 0,
};

export function getMenu(): NavItem[] {
  return menu;
}
export function getFooterMenu(): NavItem[] {
  return footerMenu;
}
export function getCollections(): Collection[] {
  return collections;
}
export function getCollection(handle: string): Collection | undefined {
  return collections.find((c) => c.handle === handle);
}
export function getProductsInCollection(handle: string, sort: SortKey = 'manual'): ProductCardData[] {
  const list = products.filter((p) => p.collections.includes(handle)).map(toCard);
  // "all-filaments" / unknown handles fall back to all products so listing pages always populate.
  const result = list.length ? list : products.map(toCard);
  return [...result].sort(sorters[sort]);
}
export function getProduct(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}
export function getAllProducts(): ProductCardData[] {
  return products.map(toCard);
}
export function getRelatedProducts(handle: string, limit = 4): ProductCardData[] {
  const p = getProduct(handle);
  const pool = p ? products.filter((x) => x.handle !== handle && x.collections.some((c) => p.collections.includes(c))) : products;
  return (pool.length ? pool : products).slice(0, limit).map(toCard);
}
export function searchProducts(query: string): ProductCardData[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => p.title.toLowerCase().includes(q) || (p.tags ?? []).some((t) => t.toLowerCase().includes(q))).map(toCard);
}
export function getArticles(): Article[] {
  return articles;
}
export function getArticle(blogHandle: string, handle: string): Article | undefined {
  return articles.find((a) => a.blogHandle === blogHandle && a.handle === handle);
}

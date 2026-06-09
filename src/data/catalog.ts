import type {
  ShopArticle,
  ShopBlog,
  ShopCollection,
  ShopImage,
  ShopProduct,
  ShopVariant,
  SortKey,
} from '@/lib/shopify/types';

/**
 * Catalog fixtures — stand in for the backend (separate repo) so the storefront renders today.
 * Content is faithful to the live theme: real collection handles + BG titles (per index.json /
 * settings_data.json), BGN prices in cents, BG product/article copy. Imagery loads from the
 * store's public Shopify CDN (nothing committed to git). The backend will serve exact media +
 * the full 150-product inventory; this is the representative sample the reference captured.
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0726/9413/7129';

const img = (path: string, alt: string, w = 960, h = 960): ShopImage => ({
  src: `${CDN}${path}`,
  alt,
  width: w,
  height: h,
  aspectRatio: w / h,
});

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

// ---- Collections (real handles + BG titles) --------------------------------------------------

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

// ---- Products (representative; BG names + BGN prices in cents) --------------------------------

let pid = 0;
let imgCursor = 0;

function makeProduct(collectionHandle: string, brand: string, base: string, basePriceCents: number): ShopProduct {
  pid += 1;
  const handle = `${brand}-${base}-${pid}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const onSale = pid % 4 === 0;
  const compareAt = onSale ? Math.round(basePriceCents * 1.25) : null;
  const media: ShopImage[] = [img(photo(imgCursor++), `${brand} ${base}`), img(photo(imgCursor++), `${brand} ${base}`)];
  const variants: ShopVariant[] = [
    {
      id: `v-${pid}`,
      title: 'Default Title',
      available: true,
      price: basePriceCents,
      compareAtPrice: compareAt,
      options: [],
      sku: `${handle}`.toUpperCase(),
      featuredImage: media[0],
    },
  ];
  return {
    id: `prod-${pid}`,
    handle,
    title: `${brand} ${base}`,
    vendor: brand,
    url: `/products/${handle}`,
    descriptionHtml: `<p>${brand} ${base} — висококачествен консуматив за 3D печат с отлична адхезия и стабилни резултати. Подходящ за широка гама от проекти.</p><ul><li>Диаметър: 1.75mm</li><li>Толеранс: ±0.02mm</li><li>Препоръчителна температура: 200–220°C</li></ul>`,
    featuredImage: media[0],
    media,
    options: [],
    variants,
    price: basePriceCents,
    priceMin: basePriceCents,
    priceMax: basePriceCents,
    compareAtPrice: compareAt,
    available: true,
    tags: [brand, base],
  };
}

const PRODUCT_PLAN: Array<{ handle: string; brand: string; bases: string[]; price: number }> = [
  { handle: 'pla-filaments', brand: '3DLine', bases: ['PLA', 'PLA Silk', 'PLA Matte', 'PLA Galaxy', 'PLA Marble', 'PLA Wood'], price: 2490 },
  { handle: 'pla-pro-filaments', brand: 'Nature3D', bases: ['PLA Pro', 'PLA Pro Silk', 'PLA Pro Tough', 'PLA Pro Matte'], price: 2890 },
  { handle: 'petg', brand: '3DLine', bases: ['PETG', 'PETG Transparent', 'PETG CF', 'PETG Pro'], price: 2790 },
  { handle: 'pla-flex', brand: 'Nature3D', bases: ['PLA Flex', 'TPU 95A', 'TPU 85A'], price: 3290 },
  { handle: 'abs', brand: 'Nature3D', bases: ['ABS', 'ABS Pro', 'ABS+'], price: 2690 },
  { handle: 'asa', brand: 'Nature3D', bases: ['ASA', 'ASA CF'], price: 2990 },
  { handle: 'nozzles', brand: 'Creativity', bases: ['Месингова дюза 0.4mm', 'Закалена дюза 0.4mm', 'Дюза 0.6mm'], price: 790 },
  { handle: '3d-printer-beds', brand: 'Creativity', bases: ['Магнитна плоча 235x235', 'PEI плоча 310x310', 'Стъклена плоча'], price: 1990 },
  { handle: 'bl-touches', brand: 'Creativity', bases: ['BL Touch сензор', 'Резервни игли BL Touch'], price: 3990 },
];

const products: ShopProduct[] = PRODUCT_PLAN.flatMap((p) => p.bases.map((base) => makeProduct(p.handle, p.brand, base, p.price)));

// Map each product back to its seed collection handle (the generation order is stable).
const productCollectionMap = new Map<string, string>();
{
  let idx = 0;
  for (const p of PRODUCT_PLAN) {
    for (let i = 0; i < p.bases.length; i++) {
      productCollectionMap.set(products[idx].id, p.handle);
      idx += 1;
    }
  }
}

const collections: ShopCollection[] = COLLECTION_SEEDS.map((c, i) => {
  const inCollection = products.filter((p) => productCollectionMap.get(p.id) === c.handle);
  return {
    id: `col-${i + 1}`,
    handle: c.handle,
    title: c.title,
    url: `/collections/${c.handle}`,
    descriptionHtml: `<p>Разгледайте нашата селекция ${c.title.toLowerCase()} — качествени консумативи и части за вашия 3D принтер на достъпни цени.</p>`,
    image: img(photo(i), c.title),
    productsCount: inCollection.length || 12,
    products: inCollection,
  };
});

// ---- Articles + blog -------------------------------------------------------------------------

const BLOG_HANDLE = '3д-принтове';
const BLOG_TITLE = '3Д Принтове';
const ARTICLE_SEEDS: Array<{ handle: string; title: string; image: string }> = [
  { handle: 'pla-срещу-pla-филамент', title: 'PLA срещу PLA+ филамент', image: '/articles/hitpla.webp' },
  { handle: 'революцията-на-3d-принтера', title: 'Революцията на 3D принтера', image: '/articles/3d-printer.jpg' },
  { handle: '3d-принтиране-за-новонавлизащи', title: '3D принтиране за новонавлизащи', image: '/articles/3dprintinghobby.webp' },
  { handle: 'типове-3d-принтери', title: 'Типове 3D принтери', image: '/articles/woodman.jpg' },
  { handle: '3dline-hitpla', title: '3DLine HiTPLA — най-добрата нишка за вашия проект', image: '/articles/hitpla.webp' },
  { handle: 'бъдещето-на-производството-rlp', title: 'Бъдещето на производството с технологията RLP', image: '/articles/rlp-cover-1.jpg' },
  { handle: 'партньорство-e3d-bambu-lab', title: 'Партньорство между E3D и Bambu Lab', image: '/articles/1280X1280-E3D-Bambu.jpg' },
  { handle: 'dimafix-спрей', title: 'DimaFix спрей за по-добро залепване', image: '/articles/producto-dimalt_1.jpg' },
  { handle: 'greenboys-extruder', title: 'GreenBoy3D екструдер', image: '/articles/Greenboy3D-hero.jpg' },
  { handle: '3d-printers-5-models', title: '5 модела 3D принтери', image: '/articles/woodman.jpg' },
];

const articles: ShopArticle[] = ARTICLE_SEEDS.map((a, i) => ({
  id: `art-${i + 1}`,
  handle: a.handle,
  blogHandle: BLOG_HANDLE,
  title: a.title,
  url: `/blogs/${BLOG_HANDLE}/${a.handle}`,
  excerpt: 'Прочетете повече за последните развития и съвети в света на 3D печата от екипа на EasyTech3D.',
  contentHtml: `<p>${a.title}. Това е примерно съдържание на статия, което ще бъде заменено от реалния бекенд.</p><p>3D печатът се развива с бързи темпове и ние държим да Ви държим в крак с новостите — нови материали, техники и оборудване.</p>`,
  image: img(a.image, a.title, 720, 480),
  author: 'EasyTech3D',
  publishedAt: `2024-0${(i % 9) + 1}-15T10:00:00.000Z`,
}));

const blog: ShopBlog = { handle: BLOG_HANDLE, title: BLOG_TITLE, url: `/blogs/${BLOG_HANDLE}`, articles };

// ---- Accessors (the "API" the backend will mirror) -------------------------------------------

const sorters: Record<SortKey, (a: ShopProduct, b: ShopProduct) => number> = {
  manual: () => 0,
  'best-selling': () => 0,
  'title-ascending': (a, b) => a.title.localeCompare(b.title),
  'title-descending': (a, b) => b.title.localeCompare(a.title),
  'price-ascending': (a, b) => a.price - b.price,
  'price-descending': (a, b) => b.price - a.price,
  'created-descending': () => 0,
};

export function getCollections(): ShopCollection[] {
  return collections;
}
export function getCollection(handle: string): ShopCollection | undefined {
  return collections.find((c) => c.handle === handle);
}
export function getProductsInCollection(handle: string, sort: SortKey = 'manual'): ShopProduct[] {
  const col = getCollection(handle);
  // unknown / aggregate handles (e.g. all-filaments) fall back to all products so listings populate.
  const list = col && col.products.length ? col.products : products;
  return [...list].sort(sorters[sort]);
}
export function getProduct(handle: string): ShopProduct | undefined {
  return products.find((p) => p.handle === handle);
}
export function getAllProducts(): ShopProduct[] {
  return products;
}
export function getRelatedProducts(handle: string, limit = 4): ShopProduct[] {
  const p = getProduct(handle);
  const primary = p ? productCollectionMap.get(p.id) : undefined;
  const pool = p ? products.filter((x) => x.handle !== handle && productCollectionMap.get(x.id) === primary) : products;
  return (pool.length ? pool : products.filter((x) => x.handle !== handle)).slice(0, limit);
}
export function searchProducts(query: string): ShopProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
export function getArticles(): ShopArticle[] {
  return articles;
}
export function getArticle(blogHandle: string, handle: string): ShopArticle | undefined {
  return articles.find((a) => a.blogHandle === blogHandle && a.handle === handle);
}
export function getBlog(handle: string): ShopBlog | undefined {
  return handle === BLOG_HANDLE ? blog : undefined;
}

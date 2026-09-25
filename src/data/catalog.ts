import 'server-only';
import { ApiError, apiFetch } from '@/lib/api/client';
import type {
  SearchResult,
  ShopArticle,
  ShopBlog,
  ShopCollection,
  ShopImage,
  ShopProduct,
  SortKey,
} from '@/lib/shopify/types';

/**
 * Catalog read layer — backed by the easytech3d-backend (NestJS) over HTTP via apiFetch
 * (`BACKEND_API_URL`). These accessors are async; callers are RSC / Server Actions that await them.
 * Responses match the Shop* contract the BE mirrors. Money is integer BGN cents.
 *
 * Articles/blog below remain editorial placeholders (static) until blog content is migrated.
 */

const REVALIDATE = 60; // seconds — catalog changes infrequently

async function orUndefined<T>(p: Promise<T>): Promise<T | undefined> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return undefined;
    throw e;
  }
}

// List/search reads degrade to a safe default on any backend error, so a transient
// outage renders an empty surface instead of a full-page crash (the old in-memory
// fixtures could never throw — this restores that "always renders" guarantee).
async function orDefault<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error('catalog read failed; serving fallback', e);
    return fallback;
  }
}

export function getCollections(): Promise<ShopCollection[]> {
  return orDefault(
    apiFetch<ShopCollection[]>('/collections', {
      next: { revalidate: REVALIDATE, tags: ['collections'] },
    }),
    [],
  );
}

export function getCollection(handle: string): Promise<ShopCollection | undefined> {
  return orUndefined(
    apiFetch<ShopCollection>(`/collections/${encodeURIComponent(handle)}`, {
      next: { revalidate: REVALIDATE },
    }),
  );
}

export function getProductsInCollection(
  handle: string,
  sort: SortKey = 'manual',
): Promise<ShopProduct[]> {
  const q = sort && sort !== 'manual' ? `?sort=${encodeURIComponent(sort)}` : '';
  return orDefault(
    apiFetch<ShopProduct[]>(`/collections/${encodeURIComponent(handle)}/products${q}`, {
      next: { revalidate: REVALIDATE },
    }),
    [],
  );
}

export function getProduct(handle: string): Promise<ShopProduct | undefined> {
  return orUndefined(
    apiFetch<ShopProduct>(`/products/${encodeURIComponent(handle)}`, {
      next: { revalidate: REVALIDATE },
    }),
  );
}

export function getAllProducts(): Promise<ShopProduct[]> {
  return orDefault(
    apiFetch<ShopProduct[]>('/products', {
      next: { revalidate: REVALIDATE, tags: ['products'] },
    }),
    [],
  );
}

export function getRelatedProducts(handle: string, limit = 4): Promise<ShopProduct[]> {
  return orDefault(
    apiFetch<ShopProduct[]>(`/products/${encodeURIComponent(handle)}/related?limit=${limit}`, {
      next: { revalidate: REVALIDATE },
    }),
    [],
  );
}

export type SearchFilters = {
  q: string;
  available?: 'in' | 'out';
  minPrice?: number; // лв
  maxPrice?: number; // лв
  sort?: SortKey;
};

const EMPTY_SEARCH: SearchResult = { products: [], priceMinCents: 0, priceMaxCents: 0, total: 0 };

export function searchCatalog(f: SearchFilters): Promise<SearchResult> {
  if (!f.q.trim()) return Promise.resolve(EMPTY_SEARCH);
  const sp = new URLSearchParams({ q: f.q.trim() });
  if (f.available === 'in') sp.set('available', 'true');
  if (f.available === 'out') sp.set('available', 'false');
  if (f.minPrice != null && !Number.isNaN(f.minPrice)) sp.set('minPrice', String(f.minPrice));
  if (f.maxPrice != null && !Number.isNaN(f.maxPrice)) sp.set('maxPrice', String(f.maxPrice));
  if (f.sort && f.sort !== 'manual') sp.set('sort', f.sort);
  // Per-query + faceted — don't cache (avoids stale results and shape drift).
  // Degrade to an empty result set on a backend error rather than crashing /search.
  return orDefault(
    apiFetch<SearchResult>(`/search?${sp.toString()}`, { cache: 'no-store' }),
    EMPTY_SEARCH,
  );
}

export async function searchProducts(query: string): Promise<ShopProduct[]> {
  return (await searchCatalog({ q: query })).products;
}

// ---- Articles + blog (editorial placeholders — static until blog content is migrated) ----------

const CDN = 'https://cdn.shopify.com/s/files/1/0726/9413/7129';

const img = (path: string, alt: string, w = 960, h = 960): ShopImage => ({
  src: `${CDN}${path}`,
  alt,
  width: w,
  height: h,
  aspectRatio: w / h,
});

const BLOG_HANDLE = '3д-принтове';
const BLOG_TITLE = '3Д Принтове';
const ARTICLE_SEEDS: Array<{ handle: string; title: string; image: string }> = [
  {
    handle: 'pla-срещу-pla-филамент',
    title: 'PLA срещу PLA+ филамент',
    image: '/articles/hitpla.webp',
  },
  {
    handle: 'революцията-на-3d-принтера',
    title: 'Революцията на 3D принтера',
    image: '/articles/3d-printer.jpg',
  },
  {
    handle: '3d-принтиране-за-новонавлизащи',
    title: '3D принтиране за новонавлизащи',
    image: '/articles/3dprintinghobby.webp',
  },
  { handle: 'типове-3d-принтери', title: 'Типове 3D принтери', image: '/articles/woodman.jpg' },
  {
    handle: '3dline-hitpla',
    title: '3DLine HiTPLA — най-добрата нишка за вашия проект',
    image: '/articles/hitpla.webp',
  },
  {
    handle: 'бъдещето-на-производството-rlp',
    title: 'Бъдещето на производството с технологията RLP',
    image: '/articles/rlp-cover-1.jpg',
  },
  {
    handle: 'партньорство-e3d-bambu-lab',
    title: 'Партньорство между E3D и Bambu Lab',
    image: '/articles/1280X1280-E3D-Bambu.jpg',
  },
  {
    handle: 'dimafix-спрей',
    title: 'DimaFix спрей за по-добро залепване',
    image: '/articles/producto-dimalt_1.jpg',
  },
  {
    handle: 'greenboys-extruder',
    title: 'GreenBoy3D екструдер',
    image: '/articles/Greenboy3D-hero.jpg',
  },
  { handle: '3d-printers-5-models', title: '5 модела 3D принтери', image: '/articles/woodman.jpg' },
];

const articles: ShopArticle[] = ARTICLE_SEEDS.map((a, i) => ({
  id: `art-${i + 1}`,
  handle: a.handle,
  blogHandle: BLOG_HANDLE,
  title: a.title,
  url: `/blogs/${BLOG_HANDLE}/${a.handle}`,
  excerpt:
    'Прочетете повече за последните развития и съвети в света на 3D печата от екипа на EasyTech3D.',
  contentHtml: `<p>${a.title}. Това е примерно съдържание на статия, което ще бъде заменено от реалния бекенд.</p><p>3D печатът се развива с бързи темпове и ние държим да Ви държим в крак с новостите — нови материали, техники и оборудване.</p>`,
  image: img(a.image, a.title, 720, 480),
  author: 'EasyTech3D',
  publishedAt: `2024-0${(i % 9) + 1}-15T10:00:00.000Z`,
}));

const blog: ShopBlog = {
  handle: BLOG_HANDLE,
  title: BLOG_TITLE,
  url: `/blogs/${BLOG_HANDLE}`,
  articles,
};

export function getArticles(): ShopArticle[] {
  return articles;
}
export function getArticle(blogHandle: string, handle: string): ShopArticle | undefined {
  return articles.find((a) => a.blogHandle === blogHandle && a.handle === handle);
}
export function getBlog(handle: string): ShopBlog | undefined {
  return handle === BLOG_HANDLE ? blog : undefined;
}

import { MedusaApiError, medusaFetch } from '@/lib/medusa/client';
import type { MedusaProduct, MedusaProductCategory } from '@/lib/medusa/mappers';
import { mapCategory, mapProduct } from '@/lib/medusa/mappers';
import { getRegionId } from '@/lib/medusa/region';
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
 * Catalog read layer — backed by Medusa's Store API (`MEDUSA_BACKEND_URL`) via `medusaFetch`
 * (contracts/medusa-storefront.md). These accessors are async; callers are RSC / Server Actions
 * that await them. Money is integer EUR cents (converted from Medusa's major-unit amounts by the
 * mappers). Articles/blog below remain editorial placeholders (static) — blog content hasn't
 * moved off Shopify yet.
 */

const REVALIDATE = 60; // seconds — catalog changes infrequently

// Field selection per contracts/medusa-storefront.md's catalog-reads section, extended with the
// sub-fields the storefront actually renders (variant option values for the PDP selector, variant
// compare-at metadata, product description/thumbnail for the PDP + card fallback).
const PRODUCT_FIELDS =
  '*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,' +
  '+variants.allow_backorder,+variants.options,+variants.metadata,+variants.thumbnail,' +
  '*options,*options.values,*categories,*tags,*images,+metadata,+description,+thumbnail';

// Deliberately does NOT ask for `products` here. Nested field selection (`products.handle`,
// `+products.handle`) is NOT honored on the product-categories relation as of the staging Medusa
// build tested 2026-09-26 — it always comes back with only `{id, title}`; the only form that
// includes `handle` is `*products` (full expansion), which pulls every member product's FULL body
// (description, images, variants, …) and blew past Next's 2MB data-cache entry limit on a real
// category during a `next build` smoke test. `fetchProductStubs` below fetches a cheap
// id/handle/title projection from `/store/products` instead (plus the accurate `count`).
const CATEGORY_FIELDS = 'id,handle,name,description,rank,metadata';

async function orUndefined<T>(p: Promise<T>): Promise<T | undefined> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof MedusaApiError && e.status === 404) return undefined;
    throw e;
  }
}

// List/search reads degrade to a safe default on any Medusa error, so a transient outage (or the
// store being empty before the manager's import finishes) renders an empty surface instead of a
// full-page crash — same guarantee the old NestJS-backed seam gave.
async function orDefault<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error('medusa: catalog read failed; serving fallback', e);
    return fallback;
  }
}

function sortProducts(products: ShopProduct[], sort: SortKey): ShopProduct[] {
  switch (sort) {
    case 'title-ascending':
      return [...products].sort((a, b) => a.title.localeCompare(b.title, 'bg'));
    case 'title-descending':
      return [...products].sort((a, b) => b.title.localeCompare(a.title, 'bg'));
    case 'price-ascending':
      return [...products].sort((a, b) => a.price - b.price);
    case 'price-descending':
      return [...products].sort((a, b) => b.price - a.price);
    default:
      // 'manual' / 'best-selling' / 'created-descending' — Medusa has no merchandising rank or
      // sales-count field wired up yet; fall back to the store's natural (id) order.
      return products;
  }
}

type ProductStub = { id: string; handle: string; title: string };

/** Cheap id/handle/title projection + the accurate total `count` for one category's products. */
async function fetchProductStubs(
  categoryId: string,
  limit = 30,
): Promise<{ products: ProductStub[]; count: number }> {
  const res = await medusaFetch<{ products: ProductStub[]; count: number }>(
    `/store/products?category_id[]=${encodeURIComponent(categoryId)}&fields=id,handle,title&limit=${limit}`,
    { withCustomerAuth: false, next: { revalidate: REVALIDATE } },
  );
  return res;
}

export function getCollections(): Promise<ShopCollection[]> {
  return orDefault(
    (async () => {
      const res = await medusaFetch<{ product_categories: MedusaProductCategory[] }>(
        `/store/product-categories?fields=${CATEGORY_FIELDS}&order=rank&limit=100`,
        { withCustomerAuth: false, next: { revalidate: REVALIDATE, tags: ['collections'] } },
      );
      return Promise.all(
        res.product_categories.map(async (c) => {
          const { products, count } = await fetchProductStubs(c.id);
          return mapCategory({ ...c, products }, count);
        }),
      );
    })(),
    [],
  );
}

export function getCollection(handle: string): Promise<ShopCollection | undefined> {
  return orUndefined(
    (async () => {
      const res = await medusaFetch<{ product_categories: MedusaProductCategory[] }>(
        `/store/product-categories?handle=${encodeURIComponent(handle)}&fields=${CATEGORY_FIELDS}&limit=1`,
        { withCustomerAuth: false, next: { revalidate: REVALIDATE } },
      );
      const category = res.product_categories[0];
      if (!category) return undefined;
      const { products, count } = await fetchProductStubs(category.id);
      return mapCategory({ ...category, products }, count);
    })(),
  );
}

export function getProductsInCollection(
  handle: string,
  sort: SortKey = 'manual',
): Promise<ShopProduct[]> {
  return orDefault(
    (async () => {
      const regionId = await getRegionId();
      const catRes = await medusaFetch<{ product_categories: { id: string }[] }>(
        `/store/product-categories?handle=${encodeURIComponent(handle)}&fields=id&limit=1`,
        { withCustomerAuth: false, next: { revalidate: REVALIDATE } },
      );
      const categoryId = catRes.product_categories[0]?.id;
      if (!categoryId) return [];

      const sp = new URLSearchParams({
        'category_id[]': categoryId,
        fields: PRODUCT_FIELDS,
        limit: '250',
      });
      if (regionId) sp.set('region_id', regionId);

      const res = await medusaFetch<{ products: MedusaProduct[] }>(
        `/store/products?${sp.toString()}`,
        { withCustomerAuth: false, next: { revalidate: REVALIDATE } },
      );
      return sortProducts(res.products.map(mapProduct), sort);
    })(),
    [],
  );
}

export function getProduct(handle: string): Promise<ShopProduct | undefined> {
  return orUndefined(
    (async () => {
      const regionId = await getRegionId();
      const sp = new URLSearchParams({ handle, fields: PRODUCT_FIELDS, limit: '1' });
      if (regionId) sp.set('region_id', regionId);
      const res = await medusaFetch<{ products: MedusaProduct[] }>(
        `/store/products?${sp.toString()}`,
        {
          withCustomerAuth: false,
          next: { revalidate: REVALIDATE },
        },
      );
      const product = res.products[0];
      return product ? mapProduct(product) : undefined;
    })(),
  );
}

export function getAllProducts(): Promise<ShopProduct[]> {
  return orDefault(
    (async () => {
      const res = await medusaFetch<{ products: MedusaProduct[] }>(
        '/store/products?fields=id,handle,title,+description&limit=1000',
        { withCustomerAuth: false, next: { revalidate: REVALIDATE, tags: ['products'] } },
      );
      return res.products.map(mapProduct);
    })(),
    [],
  );
}

// Medusa has no built-in "related products" concept. Best-effort analog per the migration:
// other products sharing the product's first category, excluding itself. Flagged as a contract
// gap (contracts/medusa-storefront.md doesn't specify a related-products endpoint).
export function getRelatedProducts(handle: string, limit = 4): Promise<ShopProduct[]> {
  return orDefault(
    (async () => {
      const regionId = await getRegionId();
      const productRes = await medusaFetch<{
        products: { id: string; categories?: { id: string }[] }[];
      }>(`/store/products?handle=${encodeURIComponent(handle)}&fields=id,*categories&limit=1`, {
        withCustomerAuth: false,
        next: { revalidate: REVALIDATE },
      });
      const product = productRes.products[0];
      const categoryId = product?.categories?.[0]?.id;
      if (!categoryId) return [];

      const sp = new URLSearchParams({
        'category_id[]': categoryId,
        fields: PRODUCT_FIELDS,
        limit: String(limit + 1),
      });
      if (regionId) sp.set('region_id', regionId);
      const res = await medusaFetch<{ products: MedusaProduct[] }>(
        `/store/products?${sp.toString()}`,
        {
          withCustomerAuth: false,
          next: { revalidate: REVALIDATE },
        },
      );
      return res.products
        .filter((p) => p.id !== product.id)
        .slice(0, limit)
        .map(mapProduct);
    })(),
    [],
  );
}

export type SearchFilters = {
  q: string;
  available?: 'in' | 'out';
  minPrice?: number; // EUR
  maxPrice?: number; // EUR
  sort?: SortKey;
};

const EMPTY_SEARCH: SearchResult = { products: [], priceMinCents: 0, priceMaxCents: 0, total: 0 };

export function searchCatalog(f: SearchFilters): Promise<SearchResult> {
  if (!f.q.trim()) return Promise.resolve(EMPTY_SEARCH);
  // Per-query + faceted — don't cache (avoids stale results and shape drift). Degrade to an empty
  // result set on a Medusa error rather than crashing /search.
  return orDefault(
    (async () => {
      const regionId = await getRegionId();
      const sp = new URLSearchParams({ q: f.q.trim(), fields: PRODUCT_FIELDS, limit: '250' });
      if (regionId) sp.set('region_id', regionId);
      const res = await medusaFetch<{ products: MedusaProduct[] }>(
        `/store/products?${sp.toString()}`,
        {
          withCustomerAuth: false,
          cache: 'no-store',
        },
      );
      const all = res.products.map(mapProduct);
      const prices = all.map((p) => p.price);
      const priceMinCents = prices.length > 0 ? Math.min(...prices) : 0;
      const priceMaxCents = prices.length > 0 ? Math.max(...prices) : 0;

      let filtered = all;
      if (f.available === 'in') filtered = filtered.filter((p) => p.available);
      if (f.available === 'out') filtered = filtered.filter((p) => !p.available);
      if (f.minPrice != null && !Number.isNaN(f.minPrice)) {
        const min = f.minPrice * 100;
        filtered = filtered.filter((p) => p.price >= min);
      }
      if (f.maxPrice != null && !Number.isNaN(f.maxPrice)) {
        const max = f.maxPrice * 100;
        filtered = filtered.filter((p) => p.price <= max);
      }
      if (f.sort && f.sort !== 'manual') filtered = sortProducts(filtered, f.sort);

      return { products: filtered, priceMinCents, priceMaxCents, total: filtered.length };
    })(),
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

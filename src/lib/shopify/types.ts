// Shopify-object-shaped types. The Liquid templates read objects like `product.title`,
// `product.compare_at_price`, `collection.products`, `block.settings.heading`. Translated React
// components consume these same shapes so the port is a 1:1 mapping, not a reinterpretation.
//
// Money is INTEGER CENTS, exactly like Shopify (`product.price` == 2490 for "24.90"). Format it
// with the helpers in ./money (moneyWithoutCurrency / dualPrice).

export interface ShopImage {
  /** Absolute URL (Shopify CDN). */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** width / height */
  aspectRatio: number;
}

export interface ShopVariant {
  id: string;
  title: string;
  available: boolean;
  /** cents */
  price: number;
  /** cents, or null when not on sale */
  compareAtPrice: number | null;
  sku?: string;
  /** selected option values, in option order (e.g. ["Черен", "1kg"]) */
  options: string[];
  featuredImage?: ShopImage | null;
}

export interface ShopOption {
  name: string;
  position: number;
  values: string[];
}

export interface ShopProduct {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  /** locale-agnostic path: /products/{handle} (the Link helper adds the locale) */
  url: string;
  descriptionHtml: string;
  featuredImage: ShopImage;
  /** all media images (first === featuredImage) */
  media: ShopImage[];
  options: ShopOption[];
  variants: ShopVariant[];
  /** cents — price of the selected/first available variant */
  price: number;
  priceMin: number;
  priceMax: number;
  /** cents, or null */
  compareAtPrice: number | null;
  available: boolean;
  tags: string[];
}

export interface ShopCollection {
  id: string;
  handle: string;
  title: string;
  /** /collections/{handle} */
  url: string;
  descriptionHtml: string;
  image: ShopImage | null;
  productsCount: number;
  /** resolved products (the real backend will paginate; fixtures inline a representative set) */
  products: ShopProduct[];
}

export interface ShopArticle {
  id: string;
  handle: string;
  blogHandle: string;
  title: string;
  /** /blogs/{blogHandle}/{handle} */
  url: string;
  excerpt: string;
  contentHtml: string;
  image: ShopImage | null;
  author: string;
  /** ISO date */
  publishedAt: string;
}

export interface ShopBlog {
  handle: string;
  title: string;
  url: string;
  articles: ShopArticle[];
}

/** A Shopify linklist item (menus). Mirrors `linklist.links` with one nesting level (mega-menu). */
export interface MenuLink {
  title: string;
  url: string;
  links?: MenuLink[];
}

export type SortKey =
  | 'manual'
  | 'best-selling'
  | 'title-ascending'
  | 'title-descending'
  | 'price-ascending'
  | 'price-descending'
  | 'created-descending';

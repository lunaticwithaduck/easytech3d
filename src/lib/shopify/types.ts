// Shopify-object-shaped types. The Liquid templates read objects like `product.title`,
// `product.compare_at_price`, `collection.products`, `block.settings.heading`. Translated React
// components consume these same shapes so the port is a 1:1 mapping, not a reinterpretation.
//
// Money is INTEGER CENTS, exactly like Shopify (`product.price` == 2490 for "24.90"). Since the
// 2026-01-01 euro changeover, catalog/cart/shipping money is EUR cents; order payloads (ShopOrder)
// carry their own `currency` (historical pre-2026 orders stay BGN). Format with ./money's `money()`.

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
  /** Hand-written Shopify SEO copy; falls back to title/description when absent. */
  seoTitle?: string;
  seoDescription?: string;
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

// ---- Cart (Phase 2) — mirrors the backend cart contract. Money is integer EUR cents. -----------

export interface ShopCartItem {
  id: string;
  variantId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  options: string[];
  url: string;
  image: ShopImage | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
}

export interface ShopCart {
  id: string;
  items: ShopCartItem[];
  itemCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  qualifiesForFreeShipping: boolean;
}

// ---- Checkout / orders (Phase 2b) -------------------------------------------------------------

export interface ShippingMethodInfo {
  id: 'ECONT' | 'SPEEDY';
  label: string;
  priceCents: number;
  baseCents: number;
}

export interface ShopOrderLineItem {
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: ShopImage | null;
  url: string;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  status: string;
  /** 'EUR' for orders placed since the 2026-01-01 changeover; 'BGN' for historical imported orders. */
  currency: 'EUR' | 'BGN';
  paymentMethod: string;
  paymentStatus: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shipping: {
    city: string;
    postalCode: string;
    address1: string;
    address2: string | null;
    province: string | null;
    method: string;
    deliveryType: string; // ADDRESS | OFFICE
    officeCode: string | null;
    officeName: string | null;
  };
  items: ShopOrderLineItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  createdAt: string;
}

// ---- Courier office pickup (Econt) ------------------------------------------------------------

export interface EcontCity {
  name: string;
  postCode: string;
}

export interface EcontOffice {
  code: string;
  name: string;
  city: string;
  postCode: string;
  address: string;
  isAPS: boolean; // Econtomat (automated parcel machine)
}

export interface SearchResult {
  products: ShopProduct[];
  priceMinCents: number;
  priceMaxCents: number;
  total: number;
}

// ---- Customer accounts (Phase 5) --------------------------------------------------------------

export interface SafeCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
}

export type SortKey =
  | 'manual'
  | 'best-selling'
  | 'title-ascending'
  | 'title-descending'
  | 'price-ascending'
  | 'price-descending'
  | 'created-descending';

// Catalog domain types — the CONTRACT the storefront renders against. The real backend (separate
// repo) will implement these; today they're served from mock data in ./data.ts. Money is minor
// units (stotinki/cents) to avoid float drift, formatted at the edge by <TextPrice>.

export type Money = {
  /** Amount in major units (e.g. 24.9 = 24.90). */
  amount: number;
  currencyCode: 'BGN' | 'EUR';
};

export type ImageRef = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ProductVariant = {
  id: string;
  title: string; // e.g. "Жълт / 1kg"
  available: boolean;
  price: Money;
  compareAtPrice?: Money | null;
  /** Option value selections, e.g. { Цвят: "Жълт", Тегло: "1kg" }. */
  selectedOptions: Record<string, string>;
  image?: ImageRef | null;
  sku?: string;
};

export type ProductOption = {
  name: string; // "Цвят"
  values: string[]; // ["Жълт", "Червен", …]
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  descriptionHtml: string;
  featuredImage: ImageRef;
  images: ImageRef[];
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: { min: Money; max: Money };
  available: boolean;
  onSale: boolean;
  /** Collection handles this product belongs to. */
  collections: string[];
  tags?: string[];
};

export type ProductCardData = {
  id: string;
  handle: string;
  title: string;
  featuredImage: ImageRef;
  price: Money;
  compareAtPrice?: Money | null;
  available: boolean;
  onSale: boolean;
  vendor?: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml?: string;
  image?: ImageRef | null;
  productCount: number;
};

export type Article = {
  id: string;
  handle: string;
  blogHandle: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  image: ImageRef;
  author: string;
  publishedAt: string; // ISO
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
  /** Optional image for mega-menu feature tiles. */
  image?: ImageRef;
};

export type SortKey = 'manual' | 'best-selling' | 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc' | 'created-desc';

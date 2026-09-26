import type {
  CourierCity,
  CourierOffice,
  SafeCustomer,
  ShippingMethodInfo,
  ShopCart,
  ShopCartItem,
  ShopCollection,
  ShopImage,
  ShopOption,
  ShopOrder,
  ShopOrderLineItem,
  ShopProduct,
  ShopVariant,
} from '@/lib/shopify/types';

/**
 * Medusa → Shop* mappers. Medusa v2 Store API shapes (verified against
 * medusajs/medusa `www/apps/api-reference/specs/store` on 2026-09-25) — see the task file for the
 * endpoints/fields consulted. Money: Medusa amounts are MAJOR units (`19.94` = 19.94 €); every
 * money field is converted to integer cents with `Math.round(amount * 100)` at this boundary.
 */

// ---- loose Medusa response shapes (only the fields we read) -----------------------------------

export interface MedusaImage {
  id?: string;
  url: string;
}

export interface MedusaOptionValue {
  id: string;
  value: string;
  option_id?: string;
}

export interface MedusaProductOption {
  id: string;
  title: string;
  values?: MedusaOptionValue[];
}

export interface MedusaCalculatedPrice {
  calculated_amount: number | null;
  currency_code?: string;
}

export interface MedusaVariant {
  id: string;
  title: string;
  sku?: string | null;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  inventory_quantity?: number;
  calculated_price?: MedusaCalculatedPrice | null;
  thumbnail?: string | null;
  images?: MedusaImage[];
  options?: MedusaOptionValue[];
  metadata?: Record<string, unknown> | null;
}

export interface MedusaCategoryRef {
  id: string;
  name: string;
  handle: string;
}

export interface MedusaTag {
  id: string;
  value: string;
}

export interface MedusaProduct {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: MedusaImage[];
  options?: MedusaProductOption[];
  variants?: MedusaVariant[];
  categories?: MedusaCategoryRef[];
  tags?: MedusaTag[];
  metadata?: Record<string, unknown> | null;
}

export interface MedusaProductCategory {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  products?: { id: string; handle: string; title: string }[];
}

export interface MedusaCartAddress {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  province?: string | null;
  country_code?: string | null;
}

export interface MedusaLineItem {
  id: string;
  quantity: number;
  unit_price: number;
  total?: number;
  subtotal?: number;
  title: string;
  product_id?: string | null;
  product_handle?: string | null;
  product_title?: string | null;
  variant_id?: string | null;
  variant_title?: string | null;
  thumbnail?: string | null;
}

export interface MedusaShippingMethod {
  id: string;
  name: string;
  amount: number;
  // Only what checkout writes lands here (delivery_type/office_code/office_name) — the carrier
  // lives on the shipping OPTION (`MedusaShippingOption.data.carrier`), not the method snapshot.
  data?: { delivery_type?: string; office_code?: string; office_name?: string } | null;
}

export interface MedusaCart {
  id: string;
  region_id?: string | null;
  email?: string | null;
  currency_code?: string;
  items?: MedusaLineItem[];
  shipping_address?: MedusaCartAddress | null;
  shipping_methods?: MedusaShippingMethod[];
  item_total?: number;
  item_subtotal?: number;
  shipping_total?: number;
  tax_total?: number;
  total?: number;
}

export interface MedusaShippingOption {
  id: string;
  name: string;
  amount: number;
  data?: { carrier?: string } | null;
}

export interface MedusaOrderAddress extends MedusaCartAddress {}

export interface MedusaOrder {
  id: string;
  display_id?: number;
  status?: string;
  fulfillment_status?: string;
  payment_status?: string;
  currency_code?: string;
  email?: string | null;
  shipping_address?: MedusaOrderAddress | null;
  items?: MedusaLineItem[];
  shipping_methods?: MedusaShippingMethod[];
  item_total?: number;
  item_subtotal?: number;
  shipping_total?: number;
  tax_total?: number;
  total?: number;
  created_at?: string;
  metadata?: Record<string, unknown> | null;
}

export interface MedusaCustomer {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  created_at?: string;
}

// ---- helpers ------------------------------------------------------------------------------

/** Medusa amounts are major units (`19.94` € = 19.94). Boundary conversion to integer cents. */
export function toCents(amount: number | null | undefined): number {
  if (amount == null || Number.isNaN(amount)) return 0;
  return Math.round(amount * 100);
}

/** Reads a metadata amount that's already in EUR major units (e.g. `variant.metadata.compare_at_amount`). */
function metadataCents(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): number | null {
  const raw = metadata?.[key];
  if (raw == null) return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? toCents(n) : null;
}

const PLACEHOLDER_IMAGE: ShopImage = {
  src: '',
  alt: '',
  width: 1000,
  height: 1000,
  aspectRatio: 1,
};

function mapImage(img: MedusaImage, alt: string): ShopImage {
  return { src: img.url, alt, width: 1000, height: 1000, aspectRatio: 1 };
}

// ---- catalog --------------------------------------------------------------------------------

function mapOptions(options: MedusaProductOption[] | undefined): ShopOption[] {
  return (options ?? []).map((o, i) => ({
    name: o.title,
    position: i + 1,
    values: (o.values ?? []).map((v) => v.value),
  }));
}

function mapVariant(
  v: MedusaVariant,
  productOptions: MedusaProductOption[],
  title: string,
): ShopVariant {
  const inventoryQty = v.inventory_quantity ?? 0;
  const available = !v.manage_inventory || Boolean(v.allow_backorder) || inventoryQty > 0;
  const image = v.thumbnail
    ? mapImage({ url: v.thumbnail }, title)
    : v.images?.[0]
      ? mapImage(v.images[0], title)
      : null;

  // Order the variant's option values to match the product's option order (Color, Size, …) —
  // ShopVariant.options is a positional array, not a map.
  const options = productOptions.map((po) => {
    const match = v.options?.find((ov) => ov.option_id === po.id);
    if (match) return match.value;
    // Fallback when option_id wasn't selected in `fields=`: match by value against the option's
    // known values (best-effort — only matters if the query shape changes upstream).
    const known = new Set((po.values ?? []).map((val) => val.value));
    return v.options?.find((ov) => known.has(ov.value))?.value ?? '';
  });

  return {
    id: v.id,
    title: v.title,
    available,
    price: toCents(v.calculated_price?.calculated_amount),
    compareAtPrice: metadataCents(v.metadata, 'compare_at_amount'),
    sku: v.sku ?? undefined,
    options,
    featuredImage: image,
  };
}

export function mapProduct(p: MedusaProduct): ShopProduct {
  const images = (p.images ?? []).map((img) => mapImage(img, p.title));
  const featuredImage =
    images[0] ?? (p.thumbnail ? mapImage({ url: p.thumbnail }, p.title) : PLACEHOLDER_IMAGE);
  const options = p.options ?? [];
  const variants = (p.variants ?? []).map((v) => mapVariant(v, options, p.title));
  const availableVariant = variants.find((v) => v.available) ?? variants[0];
  const prices = variants.map((v) => v.price).filter((n) => n > 0);

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: typeof p.metadata?.vendor === 'string' ? p.metadata.vendor : '',
    url: `/products/${p.handle}`,
    // Imported from Shopify's `body_html` via the catalog migration — already HTML.
    descriptionHtml: p.description ?? '',
    featuredImage,
    media: images.length > 0 ? images : [featuredImage],
    options: mapOptions(options),
    variants,
    price: availableVariant?.price ?? 0,
    priceMin: prices.length > 0 ? Math.min(...prices) : 0,
    priceMax: prices.length > 0 ? Math.max(...prices) : 0,
    compareAtPrice: availableVariant?.compareAtPrice ?? null,
    available: variants.some((v) => v.available),
    tags: (p.tags ?? []).map((t) => t.value),
    seoTitle: typeof p.metadata?.seo_title === 'string' ? p.metadata.seo_title : undefined,
    seoDescription:
      typeof p.metadata?.seo_description === 'string' ? p.metadata.seo_description : undefined,
  };
}

/** Lightweight product stub for `ShopCollection.products` (JSON-LD only — never rendered). */
export function mapProductStub(p: { id: string; handle: string; title: string }): ShopProduct {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: '',
    url: `/products/${p.handle}`,
    descriptionHtml: '',
    featuredImage: PLACEHOLDER_IMAGE,
    media: [PLACEHOLDER_IMAGE],
    options: [],
    variants: [],
    price: 0,
    priceMin: 0,
    priceMax: 0,
    compareAtPrice: null,
    available: false,
    tags: [],
  };
}

/**
 * `productsCount` is passed explicitly from a separate lightweight `count` read (see
 * `src/data/catalog.ts`) — `*products` (the only field-selection form that returns `handle`,
 * per the note on `CATEGORY_FIELDS`) pulls the FULL product body for every member and blew past
 * Next's 2MB data-cache entry limit on a real category during a `next build` smoke test
 * (2026-09-26 against staging). `c.products` here is already a capped, id/handle/title-only stub
 * list — never the full expansion.
 */
export function mapCategory(c: MedusaProductCategory, productsCount?: number): ShopCollection {
  const imageSrc = typeof c.metadata?.image_src === 'string' ? c.metadata.image_src : undefined;
  return {
    id: c.id,
    handle: c.handle,
    title: c.name,
    url: `/collections/${c.handle}`,
    descriptionHtml: c.description ?? '',
    image: imageSrc
      ? { src: imageSrc, alt: c.name, width: 1000, height: 1000, aspectRatio: 1 }
      : null,
    productsCount: productsCount ?? c.products?.length ?? 0,
    products: (c.products ?? []).map(mapProductStub),
  };
}

// ---- cart / checkout --------------------------------------------------------------------------

const FREE_SHIPPING_THRESHOLD_CENTS = 5369; // 53.69 € — contracts/medusa-storefront.md

function mapCartItem(it: MedusaLineItem): ShopCartItem {
  return {
    id: it.id,
    variantId: it.variant_id ?? '',
    productHandle: it.product_handle ?? '',
    productTitle: it.product_title ?? it.title,
    variantTitle: it.variant_title ?? 'Default Title',
    options: [],
    url: it.product_handle ? `/products/${it.product_handle}` : '/',
    image: it.thumbnail ? mapImage({ url: it.thumbnail }, it.product_title ?? it.title) : null,
    unitPrice: toCents(it.unit_price),
    quantity: it.quantity,
    lineTotal: toCents(it.total ?? it.subtotal ?? it.unit_price * it.quantity),
    available: true,
  };
}

export function mapCart(cart: MedusaCart): ShopCart {
  const items = (cart.items ?? []).map(mapCartItem);
  const subtotal = toCents(cart.item_total ?? cart.item_subtotal ?? 0);
  return {
    id: cart.id,
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD_CENTS,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotal),
    qualifiesForFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD_CENTS,
  };
}

/** `option.data.carrier` is `'ECONT' | 'SPEEDY'` per the courier module's contract shape. */
export function mapShippingOption(o: MedusaShippingOption): ShippingMethodInfo {
  const carrier = (o.data?.carrier ?? '').toUpperCase();
  const id: ShippingMethodInfo['id'] = carrier === 'SPEEDY' ? 'SPEEDY' : 'ECONT';
  const priceCents = toCents(o.amount);
  return { id, label: o.name, priceCents, baseCents: priceCents };
}

// Medusa v2's default order.status values ('pending' | 'completed' | 'draft' | 'archived' |
// 'canceled' | 'requires_action') don't line up 1:1 with the old server's four-state enum the UI
// already renders (OrderHistoryList's STATUS_LABEL/STATUS_CLASS). Derive the closest match from
// status + fulfillment_status + payment_status so the existing labels keep making sense.
function mapOrderStatus(o: MedusaOrder): string {
  if (o.status === 'canceled') return 'CANCELLED';
  if (o.fulfillment_status === 'shipped' || o.fulfillment_status === 'delivered')
    return 'FULFILLED';
  if (o.payment_status === 'awaiting' || o.payment_status === 'not_paid') return 'PENDING_PAYMENT';
  return 'CONFIRMED';
}

function mapOrderLineItem(it: MedusaLineItem): ShopOrderLineItem {
  return {
    productHandle: it.product_handle ?? '',
    productTitle: it.product_title ?? it.title,
    variantTitle: it.variant_title ?? 'Default Title',
    sku: '',
    quantity: it.quantity,
    unitPrice: toCents(it.unit_price),
    lineTotal: toCents(it.total ?? it.subtotal ?? it.unit_price * it.quantity),
    image: it.thumbnail ? mapImage({ url: it.thumbnail }, it.product_title ?? it.title) : null,
    url: it.product_handle ? `/products/${it.product_handle}` : '/',
  };
}

// The shipping method's own `data` on an ORDER only carries what checkout wrote to it —
// `delivery_type` / `office_code` / `office_name` per contracts/medusa-storefront.md's literal
// shape (no `carrier`). Verified live against staging Medusa 2026-09-26: `carrier` lives on the
// shipping OPTION (mapShippingOption reads it fine), not on the method snapshotted onto the order.
// Derive the carrier from the method's name instead ("Еконт" / "Спиди", set on the shipping option).
function carrierFromMethodName(name: string | undefined): 'ECONT' | 'SPEEDY' {
  const n = (name ?? '').toLowerCase();
  return n.includes('спиди') || n.includes('speedy') ? 'SPEEDY' : 'ECONT';
}

export function mapOrder(o: MedusaOrder): ShopOrder {
  const method = o.shipping_methods?.[0];
  const carrier = carrierFromMethodName(method?.name);
  const deliveryType = method?.data?.delivery_type === 'OFFICE' ? 'OFFICE' : 'ADDRESS';
  const addr = o.shipping_address;
  const shopifyName =
    typeof o.metadata?.shopify_name === 'string' ? o.metadata.shopify_name : undefined;

  return {
    id: o.id,
    orderNumber: shopifyName ?? `#${o.display_id ?? ''}`,
    status: mapOrderStatus(o),
    currency: (o.currency_code ?? 'eur').toUpperCase() === 'BGN' ? 'BGN' : 'EUR',
    paymentMethod: 'COD',
    paymentStatus: o.payment_status === 'captured' ? 'PAID' : 'PENDING',
    email: o.email ?? '',
    firstName: addr?.first_name ?? '',
    lastName: addr?.last_name ?? '',
    phone: addr?.phone ?? '',
    shipping: {
      city: addr?.city ?? '',
      postalCode: addr?.postal_code ?? '',
      address1: addr?.address_1 ?? '',
      address2: addr?.address_2 ?? null,
      province: addr?.province ?? null,
      method: carrier,
      deliveryType,
      officeCode: method?.data?.office_code ?? null,
      officeName: method?.data?.office_name ?? null,
    },
    items: (o.items ?? []).map(mapOrderLineItem),
    subtotal: toCents(o.item_total ?? o.item_subtotal ?? 0),
    shippingCost: toCents(o.shipping_total ?? 0),
    tax: toCents(o.tax_total ?? 0),
    total: toCents(o.total ?? 0),
    createdAt: o.created_at ?? new Date().toISOString(),
  };
}

export function mapCustomer(c: MedusaCustomer): SafeCustomer {
  return {
    id: c.id,
    email: c.email,
    firstName: c.first_name ?? '',
    lastName: c.last_name ?? '',
    phone: c.phone ?? null,
    createdAt: c.created_at ?? new Date().toISOString(),
  };
}

// ---- courier (Econt/Speedy office lookup — `commerce/`'s new store routes) ---------------------

// Verified live against staging Medusa 2026-09-26: `city.id` comes back as a NUMBER (Econt's own
// numeric nomenclature ids), not a string — `CourierCity.id` is `string` on our side (used only to
// build a query string), so it's normalized here.
export function mapCourierCity(c: {
  id: string | number;
  name: string;
  post_code: string;
  region?: string;
}): CourierCity {
  return { id: String(c.id), name: c.name, postCode: c.post_code, region: c.region ?? '' };
}

export function mapCourierOffice(o: {
  code: string;
  name: string;
  address: string;
  type: 'office' | 'locker';
}): CourierOffice {
  return { code: o.code, name: o.name, address: o.address, type: o.type };
}

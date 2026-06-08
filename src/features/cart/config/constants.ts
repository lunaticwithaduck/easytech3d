import type { ProductCardData } from '@/server/catalog/types';

// BG copy for the cart template. Literal Bulgarian strings flow through `<Text value=…>`; the
// translate pipeline falls back to the literal when there is no message key (per the build
// contract). Every value below is the REAL storefront string resolved from the locale chain
// (`en.default.json`, see config-copy.md §2.4) and the Liquid `cart-template`/`cart-items` markup.
export const CART_COPY = {
  // custom_page_header banner heading — `cart.general.title`.
  pageTitle: 'Количка',
  breadcrumbHome: 'Начало',
  breadcrumbCart: 'Количка',
  // `.Cart__Head` column labels (cart-items.liquid → `cart.items.*`).
  columnProduct: 'Продукти',
  columnPrice: 'Цена',
  columnQuantity: 'Количество',
  columnTotal: 'Тотално',
  // `cart.label.remove` → "Премахни {{ product }}". The accessible label on the remove control.
  removeItem: 'Премахни',
  decreaseQuantity: 'Намали количеството',
  increaseQuantity: 'Увеличи количеството',
  // Order-summary `cart__block` — title `cart.general.total`, subtotal label `cart.general.subtotal`.
  summaryTitle: 'Общо в количката',
  subtotal: 'общо',
  // `cart.general.taxes_and_shipping_at_checkout`.
  shippingNote: 'ДДС и Доставка биват калкулирани на чек-аут',
  // `cart.general.checkout` primary CTA + `cart.general.continue_shopping` link.
  checkout: 'Плащане',
  continueShopping: 'Продължете пазаруването',
  // Empty-cart state — title per the rebuild brief; message matches the live capture exactly
  // (`cart.general.empty`); CTA back to the catalog ("Обратно в начало" / `general.404.link`).
  emptyTitle: 'Количката ви е празна',
  emptyMessage: 'Количката е празна. ;(',
  backToShop: 'Обратно в начало',
} as const;

// Sample variant labels for the stub line items — the cart template has no live cart this session,
// so we synthesise plausible variant strings (ProductCardData carries no variant title).
export const SAMPLE_VARIANT_LABELS = ['Цвят: Черен', 'Цвят: Бял / Тегло: 1kg'] as const;

// How many sample rows the stub line-item table shows (the brief asks for 2 products).
export const SAMPLE_LINE_ITEM_COUNT = 2;

// A single stub line item: a product card plus a synthesised variant + starting quantity.
export type CartLineItem = {
  id: string;
  product: ProductCardData;
  variantLabel: string;
  quantity: number;
};

// Build the stub line items from real catalog cards so prices/images are coherent.
export function buildSampleLineItems(products: ProductCardData[]): CartLineItem[] {
  return products.slice(0, SAMPLE_LINE_ITEM_COUNT).map((product, index) => ({
    id: product.id,
    product,
    variantLabel: SAMPLE_VARIANT_LABELS[index] ?? SAMPLE_VARIANT_LABELS[0],
    quantity: index + 1,
  }));
}

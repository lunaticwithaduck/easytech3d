import type { ProductCardData } from '@/server/catalog/types';

// BG copy for the cart template. Literal Bulgarian strings flow through `<Text value=…>`; the
// translate pipeline falls back to the literal when there is no message key (per the build
// contract). Sourced from the live capture + the Liquid `cart-template`/`cart-items` snippets.
export const CART_COPY = {
  pageTitle: 'Количка',
  breadcrumbHome: 'Начало',
  breadcrumbCart: 'Количка',
  // Column headers from `cart-items.liquid` (cart.items.* keys).
  columnProduct: 'Продукт',
  columnPrice: 'Цена',
  columnQuantity: 'Количество',
  columnTotal: 'Общо',
  removeItem: 'Премахни продукта',
  decreaseQuantity: 'Намали количеството',
  increaseQuantity: 'Увеличи количеството',
  // Order-summary block (cart.general.* keys).
  summaryTitle: 'Обобщение на поръчката',
  subtotal: 'Междинна сума',
  shippingNote: 'Доставката и ДДС се калкулират при плащане',
  checkout: 'Към плащане',
  // Empty-cart state — text matches the live capture exactly.
  emptyMessage: 'Количката е празна. ;(',
  emptyTitle: 'Количката ви е празна',
  backToShop: 'Обратно в начало',
} as const;

// Sample variant labels for the stub line items — the cart template has no live cart this session,
// so we synthesise plausible variant strings (ProductCardData carries no variant title).
export const SAMPLE_VARIANT_LABELS = ['Цвят: Черен', 'Цвят: Бял / Тегло: 1kg'] as const;

// How many sample rows the stub line-item table shows.
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

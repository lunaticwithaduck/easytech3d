// Bulgarian pluralization for the product count: "1 продукт" vs "N продукти", matching the
// theme's `collections.general.items_with_count` locale entry (one/other forms).
export function formatProductCount(count: number): string {
  return count === 1 ? `${count} продукт` : `${count} продукти`;
}

// The list-collections card count line — the theme renders the BARE word form:
//   `{{ collection.all_products_count }} {{ 'collections.general.products' | t }}` → "N продукти".
// (Always the plural noun "продукти", not the pluralized items_with_count one/other forms.)
export function formatCollectionProductsCount(count: number): string {
  return `${count} продукти`;
}

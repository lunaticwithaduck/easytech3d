// Bulgarian pluralization for the product count: "1 продукт" vs "N продукти", matching the
// theme's `collections.general.items_with_count` locale entry (one/other forms).
export function formatProductCount(count: number): string {
  return count === 1 ? `${count} продукт` : `${count} продукти`;
}

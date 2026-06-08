import type { SortKey } from '@/server/catalog/types';

// The sort options offered in the collection toolbar, mapped 1:1 to the catalog `SortKey` union.
// `value` is what lands in `?sort=` on the URL; `label` is the BG copy shown in the control,
// mirroring the live theme's Shopify sort labels.
export type SortOption = {
  value: SortKey;
  label: string;
};

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'manual', label: 'Препоръчани' },
  { value: 'best-selling', label: 'Най-продавани' },
  { value: 'title-asc', label: 'Азбучен, А-Я' },
  { value: 'title-desc', label: 'Азбучен, Я-А' },
  { value: 'price-asc', label: 'Цена, ниска към висока' },
  { value: 'price-desc', label: 'Цена, висока към ниска' },
  { value: 'created-desc', label: 'Най-новите към най-старите' },
] as const;

export const DEFAULT_SORT: SortKey = 'manual';

const VALID_SORTS = new Set<string>(SORT_OPTIONS.map((o) => o.value));

/** Coerce a raw `?sort=` query value to a known `SortKey`, falling back to the default. */
export function parseSort(raw: string | string[] | undefined): SortKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && VALID_SORTS.has(value) ? (value as SortKey) : DEFAULT_SORT;
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useId } from 'react';
import { ChevronDownIcon } from '@/design-system/icons';
import { Text } from '@/design-system/primitives/Text/Text';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { SortKey } from '@/server/catalog/types';
import { SORT_OPTIONS } from '../../config/constants';
import {
  sortChevronVariants,
  sortFieldVariants,
  sortLabelVariants,
  sortSelectVariants,
  sortWrapperVariants,
} from './SortSelect.styles';

export type SortSelectProps = {
  value: SortKey;
};

// `.toolbar_sort_by-block` — the sort-by control: a "Сортирай:" label
// (`collections.sorting.title`) + a native <select> whose change pushes a new `?sort=` onto the URL
// via the locale-aware router, re-running the Server Component fetch with the chosen order. We keep
// the native element for accessibility and overlay the theme's `icon-chevron-down` glyph, matching
// `collection-template.liquid`'s `select#SortBy` + `{% render 'icon-chevron-down' %}`.
export function SortSelect({ value }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectId = useId();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('sort', event.target.value);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className={sortWrapperVariants()}>
      <Text as="label" htmlFor={selectId} className={sortLabelVariants()} value="Сортирай:" />
      <span className={sortFieldVariants()}>
        <select
          id={selectId}
          name="sort_by"
          value={value}
          onChange={handleChange}
          className={sortSelectVariants()}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className={sortChevronVariants()} />
      </span>
    </div>
  );
}

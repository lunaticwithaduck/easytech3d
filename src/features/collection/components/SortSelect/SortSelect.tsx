'use client';

import { ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useId } from 'react';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Text } from '@/design-system/primitives/Text/Text';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { SortKey } from '@/server/catalog/types';
import { SORT_OPTIONS } from '../../config/constants';
import {
  sortChevronVariants,
  sortFieldVariants,
  sortSelectVariants,
  sortWrapperVariants,
} from './SortSelect.styles';

export type SortSelectProps = {
  value: SortKey;
};

// Toolbar sort control: a native <select> whose change pushes a new `?sort=` onto the URL via the
// locale-aware router, re-running the Server Component fetch with the chosen order. We keep the
// native element for accessibility and overlay a chevron to match the theme's styled select.
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
      <Text
        as="label"
        size="sm"
        color="muted"
        weight="medium"
        htmlFor={selectId}
        value="Подреди:"
      />
      <span className={sortFieldVariants()}>
        <select
          id={selectId}
          name="sort"
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
        <Icon icon={ChevronDown} size={16} className={sortChevronVariants()} />
      </span>
    </div>
  );
}

'use client';

import { type FormEvent, useRef } from 'react';
import { routes } from '@/config/routes';
import { CaretIcon, SearchIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { useRouter } from '@/i18n/navigation';
import { HEADER_COPY } from '../../config/constants';
import {
  categoryButtonClass,
  categoryChevronClass,
  mobileSearchButtonVariants,
  mobileSearchIconClass,
  searchFormClass,
  searchInputClass,
  searchInteriorClass,
  searchSubmitClass,
  searchSubmitIconClass,
} from './SearchBar.styles';

/**
 * Header search — the pink pill (`.search-bar__interior`, max-w 515px, radius 50px, min-h 55px).
 * Left segment is the pink `Всички Категории ⌄` category button; the `Търсене` input fills the rest
 * with a pink magnifier submit. Submits to `routes.search` (`?q=…`). On mobile (< 750px) the pill is
 * hidden and a standalone pink circular magnifier links to the search route.
 */
export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = inputRef.current?.value.trim() ?? '';
    if (query.length === 0) {
      inputRef.current?.focus();
      return;
    }
    router.push(`${routes.search}?q=${encodeURIComponent(query)}`);
  }

  return (
    <>
      {/* DESKTOP pill */}
      <div className={searchInteriorClass}>
        <Button type="button" variant="primary" unstyled className={categoryButtonClass}>
          <Text as="span" size="sm" color="current" value={HEADER_COPY.allCategories} />
          <CaretIcon className={categoryChevronClass} />
        </Button>

        <form className={searchFormClass} action={routes.search} method="get" onSubmit={onSubmit}>
          {/* Raw type="search" input — the convention linter sanctions it (pill needs an inline
              field; the Input primitive's flex-col wrapper would break the horizontal pill). */}
          <input
            ref={inputRef}
            type="search"
            name="q"
            placeholder={HEADER_COPY.searchPlaceholder}
            aria-label={HEADER_COPY.searchPlaceholder}
            autoComplete="off"
            className={searchInputClass}
          />
          <Button
            type="submit"
            variant="primary"
            unstyled
            className={searchSubmitClass}
            aria-label={HEADER_COPY.searchLabel}
          >
            <SearchIcon className={searchSubmitIconClass} />
          </Button>
        </form>
      </div>

      {/* MOBILE circular magnifier → search route */}
      <Link
        href={routes.search}
        variant="unstyled"
        className={mobileSearchButtonVariants()}
        aria-label={HEADER_COPY.searchLabel}
      >
        <SearchIcon className={mobileSearchIconClass} />
      </Link>
    </>
  );
}

'use client';

import { type FormEvent, useRef } from 'react';
import { routes } from '@/config/routes';
import { SearchIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { useRouter } from '@/i18n/navigation';
import { SEARCH_COPY } from '../../config/constants';
import {
  fieldWrapperClass,
  inputClass,
  inputGroupClass,
  searchFormClass,
  submitClass,
  submitIconClass,
} from './SearchForm.styles';

export type SearchFormProps = {
  /** The current query, used to seed the field on a results page (`value="{searchTerms}"`). */
  query?: string;
};

// The on-page search form — 1:1 port of `form.search-form.search-page-form` (search-page.liquid).
// A pill `input-group--nowrap` (field + circular submit). Submitting routes to /search?q=… via the
// locale-aware router so the active locale prefix is preserved; the field is uncontrolled and
// pre-filled with the active query (the theme's `value="{{ searchTerms }}"`).
export function SearchForm({ query }: SearchFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = inputRef.current?.value.trim() ?? '';
    if (value.length === 0) {
      inputRef.current?.focus();
      return;
    }
    router.push(`${routes.search}?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      className={searchFormClass}
      action={routes.search}
      method="get"
      role="search"
      onSubmit={onSubmit}
    >
      <div className={inputGroupClass}>
        <div className={fieldWrapperClass}>
          <Input
            ref={inputRef}
            type="search"
            name="q"
            defaultValue={query ?? ''}
            placeholder={SEARCH_COPY.placeholder}
            aria-label={SEARCH_COPY.placeholder}
            autoComplete="off"
            className={inputClass}
          />
        </div>
        <Button type="submit" variant="primary" className={submitClass} aria-label={SEARCH_COPY.submit}>
          <SearchIcon className={submitIconClass} aria-hidden />
        </Button>
      </div>
    </form>
  );
}

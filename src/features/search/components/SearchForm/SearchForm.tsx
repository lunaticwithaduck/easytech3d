'use client';

import { Search } from 'lucide-react';
import { type FormEvent, useRef } from 'react';
import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Input } from '@/design-system/primitives/Input/Input';
import { useRouter } from '@/i18n/navigation';
import { SEARCH_COPY } from '../../config/constants';
import { searchFieldClass, searchFormClass, searchSubmitClass } from './SearchForm.styles';

export type SearchFormProps = {
  /** The current query, used to seed the field on a results page. */
  query?: string;
};

// The on-page search form (Liquid `search-page-form`). Submitting routes to /search?q=… via the
// locale-aware router; the field is uncontrolled and pre-filled with the active query.
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
    <form className={searchFormClass} action={routes.search} onSubmit={onSubmit} role="search">
      <div className={searchFieldClass}>
        <Input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={query ?? ''}
          placeholder={SEARCH_COPY.placeholder}
          aria-label={SEARCH_COPY.inputLabel}
          autoComplete="off"
        />
      </div>
      <Button type="submit" variant="primary" className={searchSubmitClass} aria-label={SEARCH_COPY.submit}>
        <Icon icon={Search} size={20} />
      </Button>
    </form>
  );
}

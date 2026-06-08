'use client';

import { Search } from 'lucide-react';
import { type FormEvent, useId, useRef, useState } from 'react';
import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Input } from '@/design-system/primitives/Input/Input';
import { useRouter } from '@/i18n/navigation';
import { HEADER_COPY } from '../../config/constants';
import { searchFieldVariants, searchFormClass, searchToggleClass } from './SearchBar.styles';

// Search affordance: a toggle reveals an inline field; submitting routes to /search?q=…
export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const [open, setOpen] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = inputRef.current?.value.trim() ?? '';
    if (!open) {
      setOpen(true);
      inputRef.current?.focus();
      return;
    }
    if (query.length === 0) {
      inputRef.current?.focus();
      return;
    }
    router.push(`${routes.search}?q=${encodeURIComponent(query)}`);
  }

  return (
    <form className={searchFormClass} action={routes.search} onSubmit={onSubmit}>
      <div className={searchFieldVariants({ open })}>
        <Input
          ref={inputRef}
          id={fieldId}
          type="search"
          name="q"
          placeholder={HEADER_COPY.searchPlaceholder}
          aria-label={HEADER_COPY.searchLabel}
          autoComplete="off"
        />
      </div>
      <Button
        type="submit"
        variant="ghost"
        unstyled
        className={searchToggleClass}
        aria-label={HEADER_COPY.searchLabel}
      >
        <Icon icon={Search} size={20} />
      </Button>
    </form>
  );
}

'use client';

import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Input } from '@/design-system/primitives/Input/Input';
import { routes } from '@/config/routes';
import { useRouter } from '@/i18n/navigation';
import { notFoundSearchFormClass } from './NotFoundSearch.styles';

/**
 * Small search affordance for the 404 page — lets a lost visitor jump straight to results.
 * Submits to the locale-aware search route via the next-intl router (no string-literal href).
 */
export function NotFoundSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `${routes.search}?q=${encodeURIComponent(trimmed)}` : routes.search);
  }

  return (
    <form onSubmit={handleSubmit} className={notFoundSearchFormClass} role="search">
      <Input
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Търсете продукти…"
        aria-label="Търсене"
        suffix={<Icon icon={Search} size={18} />}
      />
      <Button type="submit" variant="primary" size="md">
        Търсене
      </Button>
    </form>
  );
}

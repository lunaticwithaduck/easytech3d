// Search results page — server-side faceted search (availability + price + sort) driven through the
// URL: changing a facet navigates to /search?q=…&available=…&minPrice=…&maxPrice=…&sort=…, and the
// server page re-fetches the filtered set. Client component (interactive facets + search box).

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Button, Container, cn, Heading, Icon, Input, Text } from '@/design-system';
import type { SearchResult, SortKey } from '@/lib/shopify/types';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'manual', label: 'По подразбиране' },
  { value: 'price-ascending', label: 'Цена (възх.)' },
  { value: 'price-descending', label: 'Цена (низх.)' },
  { value: 'title-ascending', label: 'Име (А-Я)' },
  { value: 'title-descending', label: 'Име (Я-А)' },
];

type Filters = { available?: 'in' | 'out'; minPrice?: number; maxPrice?: number; sort?: SortKey };

function resultsWithCount(terms: string, count: number): string {
  return `${count} ${count === 1 ? 'резултат' : 'резултати'} за “${terms}”`;
}

function FacetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-[30px] first:pt-0">
      <Text as="span" size="h4" weight="bold" className="capitalize tracking-[1px]" value={title} />
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function SearchTemplate({
  query,
  result,
  filters,
}: {
  query: string;
  result: SearchResult;
  filters: Filters;
}) {
  const router = useRouter();
  const performed = query.trim().length > 0;
  const results = result.products;
  const noResults = performed && results.length === 0;

  const [available, setAvailable] = useState<'in' | 'out' | undefined>(filters.available);
  const [minPrice, setMinPrice] = useState(
    filters.minPrice != null ? String(filters.minPrice) : '',
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice != null ? String(filters.maxPrice) : '',
  );

  const boundMin = Math.floor(result.priceMinCents / 100);
  const boundMax = Math.ceil(result.priceMaxCents / 100);
  const hasFilters = Boolean(
    available || minPrice || maxPrice || (filters.sort && filters.sort !== 'manual'),
  );

  function go(next: Partial<Filters>) {
    const a = 'available' in next ? next.available : available;
    const mn = 'minPrice' in next ? next.minPrice : minPrice ? Number(minPrice) : undefined;
    const mx = 'maxPrice' in next ? next.maxPrice : maxPrice ? Number(maxPrice) : undefined;
    const s = 'sort' in next ? next.sort : filters.sort;
    const sp = new URLSearchParams({ q: query });
    if (a) sp.set('available', a);
    if (mn != null && !Number.isNaN(mn)) sp.set('minPrice', String(mn));
    if (mx != null && !Number.isNaN(mx)) sp.set('maxPrice', String(mx));
    if (s && s !== 'manual') sp.set('sort', s);
    router.push(`/search?${sp.toString()}`);
  }

  function clearFilters() {
    setAvailable(undefined);
    setMinPrice('');
    setMaxPrice('');
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-0">
        {/* ── Facet rail ── */}
        {performed && (
          <aside className="shrink-0 lg:mr-[60px] lg:w-[280px] lg:pr-[25px]">
            <FacetSection title="Наличност">
              <ul className="flex flex-col gap-[10px]">
                {(
                  [
                    { v: 'in', label: 'В наличност' },
                    { v: 'out', label: 'Изчерпан' },
                  ] as const
                ).map((opt) => (
                  <li key={opt.v} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`avail-${opt.v}`}
                      checked={available === opt.v}
                      onChange={(e) => {
                        const next = e.target.checked ? opt.v : undefined;
                        setAvailable(next);
                        go({ available: next });
                      }}
                      className="size-4 shrink-0 accent-primary"
                    />
                    <label htmlFor={`avail-${opt.v}`} className="cursor-pointer">
                      <Text as="span" size="base" value={opt.label} />
                    </label>
                  </li>
                ))}
              </ul>
            </FacetSection>

            <FacetSection title="Цена">
              <div className="flex items-center gap-3">
                <Input
                  aria-label="Мин. цена"
                  type="number"
                  min={0}
                  placeholder={String(boundMin)}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1"
                />
                <Text as="span" size="base" color="muted" value="–" />
                <Input
                  aria-label="Макс. цена"
                  type="number"
                  min={0}
                  placeholder={String(boundMax)}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="mt-4 w-full"
                onClick={() => go({})}
              >
                <Text as="span" size="sm" weight="bold" color="white" value="Приложи" />
              </Button>
            </FacetSection>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 text-sm text-ink/50 underline-offset-2 hover:text-primary hover:underline"
              >
                Изчисти филтрите
              </button>
            )}
          </aside>
        )}

        {/* ── Results column ── */}
        <div className="min-w-0 flex-1">
          <div className="text-center">
            <Heading as="h1" level={2} className="mb-[18px]">
              {performed ? resultsWithCount(query, results.length) : 'Потърсете в нашия сайт'}
            </Heading>
          </div>

          <div className="mx-auto mb-8 w-full max-w-xl">
            {noResults && (
              <Text
                as="p"
                color="muted"
                className="mb-6 text-center"
                value="Няма резултати. Пробвайте да промените ключовите думи или филтрите."
              />
            )}
            <search className="flex items-stretch gap-2">
              <form onSubmit={handleSearchSubmit} className="contents">
                <label htmlFor="search-form__input_main" className="sr-only">
                  Търсене
                </label>
                <Input
                  id="search-form__input_main"
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Търсене"
                  aria-label="Търсене"
                  className="flex-1"
                />
                <Button type="submit" size="circle" variant="primary" aria-label="Потърси">
                  <Icon name="search" className="size-5" />
                </Button>
              </form>
            </search>
          </div>

          {performed && results.length > 0 && (
            <>
              {/* Sort */}
              <div className="mb-6 flex items-center justify-end gap-2">
                <Text as="span" size="sm" color="muted" value="Подреди:" />
                <select
                  value={filters.sort ?? 'manual'}
                  onChange={(e) => go({ sort: e.target.value as SortKey })}
                  className="rounded-input border border-border bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-ink"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={cn('flex flex-col gap-y-[30px]')}>
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} showVendor list />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

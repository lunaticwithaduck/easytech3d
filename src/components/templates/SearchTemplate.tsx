// Search results page — design-system version (primitives only; no theme classes).
//
// Faithful to the live /search?q=… surface (sections/search-page.liquid, layout
// "sidebar_fixed_left"): a Container, a results heading ("{n} резултати за “{query}”"), a left
// facet rail (Наличност checkboxes + Цена range — static markup, no faceting backend) sitting
// beside a single-column list of the SHARED <ProductCard list /> (the live search view-mode is a
// list of wide horizontal cards, ~935px wide, 30px apart), plus the empty / no-results state.
//
// Exact values baked from probing https://easytech3d.com/search?q=pla:
//   • heading → h2 ladder (46.8px @1440, weight 700, tracking 2px, mb ~17.5px)
//   • sidebar → fixed ~300px wide, padding 20px 25px 20px 0, margin-right 95px (desktop)
//   • facet section title → 22px / 700 / tracking 1px / capitalize  → Text size="h4" weight="bold"
//   • facet section → padding 30px 0 ; list item → padding-bottom 10px
//   • price inputs → radius 2px (rounded-input), padding 10px  → <Input>
//
// BG strings inlined from locales (general.search.*):
//   results_with_count.other → "{count} резултати за “{terms}”" · .one → "{count} резултат …"
//   no_results → "Няма резултати. Пробвайте да промените ключовите думи"
//   placeholder "Търсене" · submit "Потърси" · sidebar.mobile_open_button "Филтър"
//   title (not performed) → "Потърсете в нашия сайт" · heading (plural) → "Резултати на търсенето"
//
// NOTE: the search form is interactive (controlled `q` param), so this is a Client Component.
// The parent page.tsx is a Server Component that fetches data and passes it down.

'use client';

import { useRouter } from 'next/navigation';
import { Button, Container, Heading, Icon, Input, Text, cn } from '@/design-system';
import { ProductCard } from '@/components/product/ProductCard';
import type { ShopProduct } from '@/lib/shopify/types';

// Replicate Liquid: {{ 'general.search.results_with_count' | t: terms, count }}.
function resultsWithCount(terms: string, count: number): string {
  const noun = count === 1 ? 'резултат' : 'резултати';
  return `${count} ${noun} за “${terms}”`;
}

// One collapsible-looking facet block (static — no faceting backend, markup only).
function FacetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-[30px] first:pt-0">
      <span className="flex items-center justify-between">
        <Text
          as="span"
          size="h4"
          weight="bold"
          className="capitalize tracking-[1px]"
          value={title}
        />
        <Icon name="caret" className="size-3 shrink-0 text-ink" />
      </span>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function SearchTemplate({
  query,
  results,
}: {
  query: string;
  results: ShopProduct[];
}) {
  const router = useRouter();

  // In our data layer `query` is already the clean search term.
  const searchTerms = query;
  const performed = searchTerms.trim().length > 0;
  const resultsCount = results.length;
  const noResults = performed && resultsCount === 0;
  const showSidebar = resultsCount > 0;

  const headerHeading = performed
    ? resultsWithCount(searchTerms, resultsCount)
    : 'Потърсете в нашия сайт';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <Container className="py-8 md:py-12">
      <div className={cn('flex flex-col gap-8 lg:flex-row lg:gap-0')}>
        {/* ── Facet rail (static) — fixed width beside the results on desktop ── */}
        {showSidebar && (
          <aside className="shrink-0 lg:w-[300px] lg:pr-[25px] lg:mr-[95px]">
            <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
              <input type="hidden" name="q" value={searchTerms} />

              {/* Наличност */}
              <FacetSection title="Наличност">
                <ul className="flex flex-col gap-[10px]">
                  <li className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="filter.v.availability"
                      value="1"
                      id="Filter-Availability-1"
                      className="size-4 shrink-0 accent-primary"
                    />
                    <label htmlFor="Filter-Availability-1" className="cursor-pointer">
                      <Text as="span" size="base" value="В наличност" />
                    </label>
                  </li>
                  <li className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="filter.v.availability"
                      value="0"
                      id="Filter-Availability-2"
                      className="size-4 shrink-0 accent-primary"
                    />
                    <label htmlFor="Filter-Availability-2" className="cursor-pointer">
                      <Text as="span" size="base" value="Изчерпан" />
                    </label>
                  </li>
                </ul>
              </FacetSection>

              {/* Цена */}
              <FacetSection title="Цена">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label htmlFor="Filter-price-gte" className="sr-only">
                      Мин. Цена
                    </label>
                    <Input
                      id="Filter-price-gte"
                      name="filter.v.price.gte"
                      type="number"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <Text as="span" size="base" color="muted" value="-" />
                  <div className="flex-1">
                    <label htmlFor="Filter-price-lte" className="sr-only">
                      Макс Цена
                    </label>
                    <Input
                      id="Filter-price-lte"
                      name="filter.v.price.lte"
                      type="number"
                      placeholder="2454"
                      min={0}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <input
                    type="range"
                    name="filter.v.price.gte.range"
                    defaultValue={0}
                    min={0}
                    max={2454}
                    step={1}
                    aria-label="Мин. Цена"
                    className="w-full accent-primary"
                  />
                  <input
                    type="range"
                    name="filter.v.price.lte.range"
                    defaultValue={2454}
                    min={0}
                    max={2454}
                    step={1}
                    aria-label="Макс Цена"
                    className="w-full accent-primary"
                  />
                </div>
              </FacetSection>
            </form>
          </aside>
        )}

        {/* ── Results column ── */}
        <div className="min-w-0 flex-1">
          {/* Heading (header_image blank → rendered inline) */}
          <div className="text-center">
            <Heading as="h1" level={2} className="mb-[18px]">
              {performed && <span className="sr-only">Резултати на търсенето: </span>}
              {headerHeading}
            </Heading>
          </div>

          {/* Search form (action /search → navigates client-side) */}
          <div className="mx-auto mb-10 w-full max-w-xl">
            {noResults && (
              <Text
                as="p"
                color="muted"
                className="mb-6 text-center"
                value="Няма резултати. Пробвайте да промените ключовите думи"
              />
            )}

            <form role="search" onSubmit={handleSubmit} className="flex items-stretch gap-2">
              <label htmlFor="search-form__input_main" className="sr-only">
                Търсене
              </label>
              <Input
                id="search-form__input_main"
                type="search"
                name="q"
                defaultValue={searchTerms}
                placeholder="Търсене"
                aria-label="Търсене"
                className="flex-1"
              />
              <Button type="submit" size="circle" variant="primary" aria-label="Потърси">
                <Icon name="search" className="size-5" />
              </Button>
            </form>
          </div>

          {/* Results */}
          {performed && (
            <>
              <h2 className="sr-only">Резултати на търсенето</h2>

              {showSidebar && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mb-6 lg:hidden"
                  aria-label="Филтър"
                >
                  <Text as="span" size="sm" weight="bold" color="white" value="Филтър" />
                  <Icon name="filter" className="size-4 shrink-0" />
                </Button>
              )}

              {resultsCount > 0 && (
                <div className="flex flex-col gap-y-[30px]">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} showVendor list />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

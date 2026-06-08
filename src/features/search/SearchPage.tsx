import { SearchLoopIcon } from '@/design-system/icons';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { ProductCard } from '@/features/_shared/ProductCard/ProductCard';
import { Section } from '@/features/_shared/Section/Section';
import { searchProducts } from '@/server/catalog/data';
import { SearchForm } from './components/SearchForm/SearchForm';
import { SEARCH_COPY } from './config/constants';
import {
  formRowClass,
  headingBlockClass,
  noResultsClass,
  noResultsHintClass,
  noResultsIconClass,
  pageClass,
  resultsGridClass,
} from './SearchPage.styles';

export type SearchPageProps = {
  /** The raw `q` query param (already awaited from searchParams by the route). */
  query?: string;
};

/**
 * SearchPage — 1:1 port of `sections/search-page.liquid` for this store's `search.json`
 * (no header image, `searchMode = product`, paginate by 10).
 *
 * DOM/order reproduced (the `header_image == blank` branch):
 *   .page-width > .Search_Section > .search-page-wrapper
 *     ├ .text-center > h1.h2            → title ("Потърсете…") or the result-count line
 *     ├ .rte.search--no-results-found   → no-results message (only when performed & 0 results)
 *     ├ form.search-page-form           → the pill search Input (submits ?q=)
 *     └ .SearchGrid.grid                → ProductCard grid of results (3-up desktop)
 *
 * The heading IS the result-count line in the theme: when a search runs it renders
 * `{count} резултати за “{terms}”` (general.search.results_with_count) as the `<h1 class="h2">`.
 */
export function SearchPage({ query }: SearchPageProps) {
  const term = query?.trim() ?? '';
  const performed = term.length > 0;
  const results = performed ? searchProducts(term) : [];
  const hasResults = results.length > 0;

  return (
    <Section background="white">
      <Container>
        <div className={pageClass}>
          <div className={headingBlockClass}>
            {performed ? (
              <Heading as="h1" level="h2">
                <span className="sr-only">{`${SEARCH_COPY.headingSr}: `}</span>
                <Text
                  as="span"
                  color="current"
                  value={SEARCH_COPY.resultsWithCount}
                  params={{ count: results.length, terms: term }}
                />
              </Heading>
            ) : (
              <Heading as="h1" level="h2" value={SEARCH_COPY.title} />
            )}
          </div>

          {performed && !hasResults ? (
            <div className={noResultsClass}>
              <SearchLoopIcon className={noResultsIconClass} aria-hidden />
              <Text
                as="p"
                color="muted"
                className={noResultsHintClass}
                value={SEARCH_COPY.noResults}
              />
            </div>
          ) : null}

          <div className={formRowClass}>
            <SearchForm query={term} />
          </div>

          {performed && hasResults ? (
            <div className={resultsGridClass}>
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

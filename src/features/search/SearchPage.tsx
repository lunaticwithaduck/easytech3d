import { PackageSearch, SearchX } from 'lucide-react';
import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { ProductCard } from '@/features/_shared/ProductCard/ProductCard';
import { Section } from '@/features/_shared/Section/Section';
import { searchProducts } from '@/server/catalog/data';
import { SearchForm } from './components/SearchForm/SearchForm';
import { SEARCH_COPY } from './config/constants';
import {
  emptyCtaClass,
  emptyHintClass,
  emptyIconClass,
  emptyStateClass,
  formRowClass,
  headerClass,
  productGridClass,
  resultCountClass,
} from './SearchPage.styles';

export type SearchPageProps = {
  /** The raw `q` query param (already awaited from searchParams by the route). */
  query?: string;
};

// Search results page (Liquid `search-page.liquid`): a centered heading + search form, a result
// count line, and a product grid — with empty states when there's no query or no matches.
export function SearchPage({ query }: SearchPageProps) {
  const term = query?.trim() ?? '';
  const hasQuery = term.length > 0;
  const results = hasQuery ? searchProducts(term) : [];
  const hasResults = results.length > 0;

  return (
    <Section background="white">
      <Container>
        <div className={headerClass}>
          <Text
            as="span"
            color="primary"
            size="sm"
            weight="semibold"
            className="uppercase tracking-wide"
            value={SEARCH_COPY.eyebrow}
          />
          <Text as="h1" size="4xl" weight="bold" value={SEARCH_COPY.title} />
          <div className={formRowClass}>
            <SearchForm query={term} />
          </div>
        </div>

        {hasQuery && hasResults ? (
          <>
            <Text
              as="p"
              size="lg"
              weight="medium"
              color="text"
              className={resultCountClass}
              value={SEARCH_COPY.resultsWithCount}
              params={{ count: results.length, terms: term }}
            />
            <div className={productGridClass}>
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className={emptyStateClass}>
            <Icon
              icon={hasQuery ? SearchX : PackageSearch}
              size={48}
              className={emptyIconClass}
            />
            <Text
              as="h2"
              size="2xl"
              weight="semibold"
              value={hasQuery ? SEARCH_COPY.noResultsTitle : SEARCH_COPY.emptyTitle}
            />
            <Text
              as="p"
              size="base"
              color="muted"
              className={emptyHintClass}
              value={hasQuery ? SEARCH_COPY.noResultsHint : SEARCH_COPY.emptyHint}
            />
            <Button asChild variant="outline" size="lg" className={emptyCtaClass}>
              <Link href={routes.collections} variant="unstyled">
                <Text as="span" color="current" value={SEARCH_COPY.browseAll} />
              </Link>
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}

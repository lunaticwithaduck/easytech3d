import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import type { ProductCardData } from '@/server/catalog/types';
import { cartHeadingClass, cartPageRootClass } from './CartPage.styles';
import { CartContents } from './components/CartContents/CartContents';
import { buildSampleLineItems, CART_COPY } from './config/constants';

export type CartPageProps = {
  /** Catalog cards used to seed the stub line-item rows. */
  sampleProducts: ProductCardData[];
};

// Cart route template (Server Component). 1:1 of `cart-template.liquid`: the `custom_page_header`
// "Количка" heading (no banner image is set on cart.json, so it renders as the centered
// `page_header_heading`), then the interactive `CartContents` body — which toggles between the
// populated `.Cart__ItemList` table and the empty-cart state as rows are removed. No live cart this
// session — the rows are stub data built from the catalog (2 sample products).
export function CartPage({ sampleProducts }: CartPageProps) {
  const items = buildSampleLineItems(sampleProducts);

  return (
    <Section>
      <Container className={cartPageRootClass}>
        <Heading as="h1" level="h2" className={cartHeadingClass} value={CART_COPY.pageTitle} />
        <CartContents initialItems={items} />
      </Container>
    </Section>
  );
}

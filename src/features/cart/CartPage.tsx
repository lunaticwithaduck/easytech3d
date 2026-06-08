import { routes } from '@/config/routes';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
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

// Cart route template (Server Component). Renders the breadcrumb trail + "Количка" heading, then
// hands the interactive body to the client `CartContents`, which toggles between the populated
// line-item table and the empty-cart state as rows are removed. No live cart this session — the
// rows are stub data built from the catalog.
export function CartPage({ sampleProducts }: CartPageProps) {
  const items = buildSampleLineItems(sampleProducts);
  const breadcrumbs = [
    { label: CART_COPY.breadcrumbHome, href: routes.home },
    { label: CART_COPY.breadcrumbCart },
  ];

  return (
    <Section>
      <Container className={cartPageRootClass}>
        <Breadcrumbs items={breadcrumbs} />
        <Text as="h1" size="4xl" weight="bold" className={cartHeadingClass} value={CART_COPY.pageTitle} />
        <CartContents initialItems={items} />
      </Container>
    </Section>
  );
}

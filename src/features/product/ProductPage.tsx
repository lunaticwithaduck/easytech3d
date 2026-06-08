import { routes } from '@/config/routes';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import { PriceTag } from '@/features/_shared/PriceTag/PriceTag';
import { ProductCarousel } from '@/features/_shared/ProductCarousel/ProductCarousel';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import type { Product, ProductCardData } from '@/server/catalog/types';
import { AddToCart } from './components/AddToCart/AddToCart';
import { ProductGallery } from './components/ProductGallery/ProductGallery';
import { VariantSelector } from './components/VariantSelector/VariantSelector';
import {
  dividerClass,
  productInfoClass,
  productLayoutClass,
  proseClass,
  relatedSectionClass,
  taxNoteClass,
  vendorClass,
} from './ProductPage.styles';

export type ProductPageProps = {
  product: Product;
  related: ProductCardData[];
};

// Product detail page: breadcrumb trail, a two-column media-gallery / buy-box split, the long-form
// description, and a "Подобни продукти" carousel. Server-rendered; the gallery, variant selector
// and add-to-cart row are client islands. Mirrors sections/product-template.liquid.
export function ProductPage({ product, related }: ProductPageProps) {
  const breadcrumbs = [
    { label: 'Начало', href: routes.home },
    { label: 'Всички категории', href: routes.collections },
    { label: product.title },
  ];

  const compareAt = product.onSale
    ? { amount: Math.round(product.priceRange.min.amount * 1.25 * 100) / 100, currencyCode: product.priceRange.min.currencyCode }
    : null;

  return (
    <Container className="py-8 lg:py-12">
      <Breadcrumbs items={breadcrumbs} className="mb-6" />

      <div className={productLayoutClass}>
        <ProductGallery images={product.images} title={product.title} />

        <div className={productInfoClass}>
          {product.vendor ? (
            <Text as="span" size="sm" weight="medium" color="muted" className={vendorClass}>
              {product.vendor}
            </Text>
          ) : null}

          <Text as="h1" size="4xl" weight="bold" color="text">
            {product.title}
          </Text>

          <div>
            <PriceTag price={product.priceRange.min} compareAtPrice={compareAt} size="2xl" />
            <Text as="p" size="xs" color="muted" className={taxNoteClass} value="ДДС включено" />
          </div>

          <VariantSelector options={product.options} />

          <AddToCart available={product.available} />

          <div className={dividerClass} />

          {/* Raw product HTML from the catalog API, styled via the prose token rules. */}
          <div
            className={proseClass}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted catalog descriptionHtml
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>
      </div>

      {related.length > 0 ? (
        <Section className={relatedSectionClass}>
          <SectionHeading title="Подобни продукти" subtitle="Може също да харесате" align="center" />
          <ProductCarousel products={related} className="mt-8" />
        </Section>
      ) : null}
    </Container>
  );
}

import { routes } from '@/config/routes';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { PriceTag } from '@/features/_shared/PriceTag/PriceTag';
import type { Product, ProductCardData } from '@/server/catalog/types';
import { AddToCart } from './components/AddToCart/AddToCart';
import { ProductGallery } from './components/ProductGallery/ProductGallery';
import { ProductRating } from './components/ProductRating/ProductRating';
import { ProductRecommendations } from './components/ProductRecommendations/ProductRecommendations';
import { VariantSelector } from './components/VariantSelector/VariantSelector';
import {
  breadcrumbsClass,
  descriptionClass,
  infoColumnClass,
  mediaGroupClass,
  metaClass,
  metaStackClass,
  pageWidthSmallClass,
  priceBlockClass,
  productSingleClass,
  recommendationsSectionClass,
  skuClass,
  taxNoteClass,
  titleClass,
  vendorClass,
} from './ProductPage.styles';

export type ProductPageProps = {
  product: Product;
  related: ProductCardData[];
};

/**
 * Product detail page — 1:1 port of `sections/product-template.liquid` + `product-recommendations`.
 *
 * Layout (this store's settings — media_size=medium, thumbnails grid 4, zoom on, mobile sticky CTA):
 *   .page-width-small (1280px)
 *     ├ breadcrumbs (Начало › … › title)
 *     ├ .grid.product-single.product-single--medium-media
 *     │   ├ LEFT  .product-single__media-group (medium-up--one-half): gallery + 4-up thumbnails
 *     │   └ RIGHT .grid__item (medium-up--one-half) > .product-single__meta — block_order:
 *     │        sku_block → product_vendor → product_title (h1.h3) → rating → product_price
 *     │        (dual лв/€ + "ДДС Включено.") → product_options_block (color swatches / pills) →
 *     │        quantity_block (.QuantitySelector) → product_buttons (.btn--primary, mobile-sticky)
 *     ├ full-width description (.rte, product_description desc_display=full_width)
 *     └ product-recommendations carousel ("Може също да харесате…", grid_mobile 2)
 *
 * Server-rendered; the gallery, variant selector and add-to-cart row are client islands.
 */
export function ProductPage({ product, related }: ProductPageProps) {
  const breadcrumbs = [
    { label: 'Начало', href: routes.home },
    { label: 'Всички категории', href: routes.collections },
    { label: product.title },
  ];

  // The PDP renders the first variant's compare-at as the struck price (snippets/product-price.liquid
  // uses `variant.compare_at_price`). The mock derives it from the on-sale flag (compare = price×1.25).
  const compareAt = product.onSale
    ? {
        amount: Math.round(product.priceRange.min.amount * 1.25 * 100) / 100,
        currencyCode: product.priceRange.min.currencyCode,
      }
    : null;

  const sku = product.variants[0]?.sku;

  return (
    <div className={pageWidthSmallClass}>
      <Breadcrumbs items={breadcrumbs} className={breadcrumbsClass} />

      <div className={productSingleClass}>
        {/* LEFT — media gallery + thumbnails (client island) */}
        <div className={mediaGroupClass}>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* RIGHT — buy box, in the theme's block_order */}
        <div className={infoColumnClass}>
          <div className={`${metaClass} ${metaStackClass}`}>
            {/* sku_block */}
            {sku ? (
              <Text as="p" className={skuClass} value="SKU: {sku}" params={{ sku }} />
            ) : null}

            {/* product_vendor */}
            {product.vendor ? (
              <Text as="span" className={vendorClass}>
                {product.vendor}
              </Text>
            ) : null}

            {/* product_title — h1 styled as the theme's .h3 */}
            <Heading as="h1" level="h3" className={titleClass}>
              {product.title}
            </Heading>

            {/* rating */}
            <ProductRating rating={4.5} ratingMax={5} count={12} />

            {/* product_price — dual лв/€ + "ДДС Включено." */}
            <div className={priceBlockClass}>
              <PriceTag price={product.priceRange.min} compareAtPrice={compareAt} size="2xl" />
              <Text as="p" className={taxNoteClass} value="ДДС Включено." />
            </div>

            {/* product_options_block — color swatches / value pills (client island) */}
            <VariantSelector options={product.options} />

            {/* quantity_block + product_buttons (client island) */}
            <AddToCart available={product.available} />
          </div>
        </div>
      </div>

      {/* product_description — full_width, rendered below the two-column block */}
      <div
        className={descriptionClass}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted catalog descriptionHtml
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      />

      {/* product-recommendations — "Може също да харесате…" carousel */}
      {related.length > 0 ? (
        <div className={recommendationsSectionClass}>
          <ProductRecommendations products={related} />
        </div>
      ) : null}
    </div>
  );
}

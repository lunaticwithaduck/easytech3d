import { routes } from '@/config/routes';
import type { Collection, ProductCardData, SortKey } from '@/server/catalog/types';
import {
  collectionSectionVariants,
  pageVariants,
  pageWidthVariants,
} from './CollectionPage.styles';
import { CollectionBanner } from './components/CollectionBanner/CollectionBanner';
import { CollectionDescription } from './components/CollectionDescription/CollectionDescription';
import { CollectionHeader } from './components/CollectionHeader/CollectionHeader';
import { CollectionToolbar } from './components/CollectionToolbar/CollectionToolbar';
import { ProductGrid } from './components/ProductGrid/ProductGrid';

export type CollectionPageProps = {
  collection: Collection;
  products: ProductCardData[];
  sort: SortKey;
};

/**
 * CollectionPage — faithful 1:1 port of `sections/collection-template.liquid` for this store's
 * settings (collection_image_mode: banner, breadcrumbs on, grid 3 / grid_mobile 1, overlay #000@40%,
 * description bottom, off_canvas_sidebar with filters: none):
 *
 *   <header class="collection-header">
 *     {% render 'custom_page_header' ... show_collection_filters_toolbar:true %}   (banner: image +
 *        #000@40% overlay, breadcrumbs, H1 title + count, filters toolbar)  — when collection.image
 *     ...else .section-header (breadcrumbs + title/count + toolbar)               — when no image
 *   </header>
 *   <div class="page-width">
 *     <div class="Collection_Section filters_view_mode_off_canvas_sidebar"><div id="Collection">
 *        <div class="grid ... grid--view-items">{% include 'product-card-item' %} …</div>
 *        {collection.description (rte, bottom)}
 *     </div></div>
 *   </div>
 *
 * Breadcrumbs follow `snippets/breadcrumbs.liquid`: `Начало › {collection.title}`.
 */
export function CollectionPage({ collection, products, sort }: CollectionPageProps) {
  const breadcrumbs = [{ label: 'Начало', href: routes.home }, { label: collection.title }];
  const toolbar = <CollectionToolbar sort={sort} />;

  return (
    <div className={pageVariants()}>
      {collection.image ? (
        <CollectionBanner
          image={collection.image}
          title={collection.title}
          count={products.length}
          breadcrumbs={breadcrumbs}
          toolbar={toolbar}
        />
      ) : null}

      <div className={pageWidthVariants()}>
        {collection.image ? null : (
          <CollectionHeader
            title={collection.title}
            count={products.length}
            breadcrumbs={breadcrumbs}
            toolbar={toolbar}
          />
        )}

        <div className={collectionSectionVariants()}>
          <ProductGrid products={products} />

          {collection.descriptionHtml ? (
            <CollectionDescription html={collection.descriptionHtml} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

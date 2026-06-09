// Translation of sections/collection-template.liquid (template config templates/collection.json).
//
// Config drives the static branches we render:
//   show_banner                       → default FALSE (plain text header); a small allowlist of
//                                       collections (see BANNER_COLLECTION_HANDLES) renders the
//                                       dark image banner instead, matching the live store.
//   show_breadcrumbs: true            → breadcrumbs render inside the banner (custom_page_header)
//   image_overlay_color: "#000000"    → dark overlay div
//   image_overlay_opacity: 40         → overlay opacity 40%
//   grid: 3                           → max_height 345, grid_item_width "medium-up--one-third"
//   grid_mobile: "1"                  → grid_item_mobile_width "small--one-whole"
//   show_collection_description: "bottom" → description (Rte) after the grid
//   sort_enable: false                → no sort control
//
// The banner markup is the inlined translation of snippets/custom_page_header.liquid (image + dark
// overlay + h1.page_header_heading + breadcrumbs + filters toolbar). The Warehouse flexbox product
// grid and the bottom description are translated from the section. Class names are verbatim so the
// theme's own CSS (already loaded globally) styles everything.
//
// Ground truth: tools/output/reference/mirror/collections/abs/index.html
//   header.collection-header (1620), grid--view-items wrapper (1689),
//   collection-description.rte.bottom_collection_description (2782).

import { Breadcrumbs } from '@/components/snippets/Breadcrumbs';
import { Icon } from '@/components/snippets/Icon';
import { Rte } from '@/components/snippets/Rte';
import { ProductCardItem } from '@/components/product/ProductCardItem';
import { imageUrl, imageSrcset } from '@/lib/shopify/image';
import type { ShopCollection, ShopProduct } from '@/lib/shopify/types';

// {% case section.settings.grid %} {% when 3 %} {%- assign max_height = 345 -%}
const MAX_HEIGHT = 345;

// Overlay from section.settings: color #000000, opacity 40 → `background: #000; opacity: 40%`.
const IMAGE_OVERLAY_COLOR = '#000000';
const IMAGE_OVERLAY_OPACITY = 40;

// On the live store almost every collection renders the PLAIN text header (show_banner == false);
// only a handful (the ones whose per-collection template enables collection_image_mode 'banner'
// with a featured image) get the dark image banner. We model that with an explicit allowlist so
// the default is the plain header. `nozzles` (Дюзи за 3D принтер) is the canonical banner page —
// see tools/output/reference/mirror/collections/nozzles/index.html.
const BANNER_COLLECTION_HANDLES = new Set(['nozzles']);

export function CollectionTemplate({
  collection,
  products,
}: {
  collection: ShopCollection;
  products: ShopProduct[];
}) {
  const { image } = collection;
  // {%  assign show_banner = false %} … banner mode + collection.image present → true.
  // Default to the plain header; only the allowlisted handles (with an image) get the banner.
  const showBanner = image != null && BANNER_COLLECTION_HANDLES.has(collection.handle);

  // Breadcrumbs: home + current collection (matches snippets/breadcrumbs.liquid for a collection).
  const breadcrumbItems = [
    { title: 'Начало', url: '/' },
    { title: collection.title, url: collection.url },
  ];

  return (
    <div
      data-section-type="collection-template"
      data-pagination_mode="standart"
      className=""
    >
      <header className="collection-header">
        {showBanner && image && (
          // {% render 'custom_page_header' ... %} — inlined translation (snippets/custom_page_header.liquid).
          <div className="custom_page_header_section">
            <img
              className=""
              srcSet={imageSrcset(image.src, image.width)}
              src={imageUrl(image.src, 750)}
              sizes="100vw"
              loading="lazy"
              alt={image.alt || collection.title}
              width={image.width}
              height={image.height}
            />

            <div
              className="custom_page_header_opacity"
              style={{
                background: IMAGE_OVERLAY_COLOR,
                opacity: `${IMAGE_OVERLAY_OPACITY}%`,
              }}
            />

            <div className="page-width">
              <h1 className="h2 page_header_heading">{collection.title}</h1>

              <Breadcrumbs items={breadcrumbItems} />

              <div className="custom_header-filters-toolbar-block">
                <div className="filters-toolbar">
                  {/* filters_view_mode !== 'no_sidebar' → off_canvas_sidebar shows the mobile open button */}
                  <button type="button" className="btn btn--primary open_mobile_sidebar">
                    <span>Филтър</span>
                  </button>
                  <button
                    type="button"
                    className="collection__layout-button is-selected"
                    aria-label="Мрежа"
                    data-action="change-layout"
                    data-layout-mode="grid"
                  >
                    <Icon name="grid" />
                  </button>
                  <button
                    type="button"
                    className="collection__layout-button "
                    aria-label="Лист"
                    data-action="change-layout"
                    data-layout-mode="list"
                  >
                    <Icon name="list" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The section always emits this .page-width. In banner mode its conditional contents
            (the show_banner==false section-header and the image-mode <img>) are skipped; in the
            default plain mode it holds the breadcrumbs + collection heading + filters toolbar. */}
        <div className="page-width">
          {/* {% if show_banner == false %} — the plain text header (default on the live store).
              Ground truth: tools/output/reference/mirror/collections/abs/index.html (1627). */}
          {!showBanner && (
            <div className="section-header">
              <Breadcrumbs items={breadcrumbItems} />
              <div className="section-header-wrapper">
                <div className="section-header-wrapper-collection">
                  <span className="visually-hidden">Колекция: </span>
                  <h1 className="h2">{collection.title}</h1>
                  <span className="filters-toolbar__product-count">
                    {collection.productsCount} продукти
                  </span>
                </div>

                <div className="filters-toolbar">
                  {/* filters_view_mode !== 'no_sidebar' → off_canvas_sidebar shows the mobile open button */}
                  <button
                    type="button"
                    className="lap-and-up--hide open_mobile_sidebar  btn btn--primary"
                  >
                    <span>Филтър</span>
                  </button>
                  <button
                    type="button"
                    className="collection__layout-button is-selected"
                    aria-label="Мрежа"
                    data-action="change-layout"
                    data-layout-mode="grid"
                  >
                    <Icon name="grid" />
                  </button>
                  <button
                    type="button"
                    className="collection__layout-button "
                    aria-label="Лист"
                    data-action="change-layout"
                    data-layout-mode="list"
                  >
                    <Icon name="list" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="page-width">
        <div className="Collection_Section filters_view_mode_off_canvas_sidebar">
          <div id="Collection">
            {/* pagination_mode "standart" → no AjaxinateContainer id */}
            <div className="CollectionGrid ">
              <div className="zoom-fade-animation grid use_align_height Collection-wrapper grid--uniform grid--view-items zoomFade-animation">
                {products.map((product) => (
                  <ProductCardItem key={product.id} product={product} maxHeight={MAX_HEIGHT} />
                ))}
              </div>
            </div>

            {/* show_collection_description == 'bottom' && collection.description != blank */}
            {collection.descriptionHtml && (
              <Rte
                html={collection.descriptionHtml}
                className="collection-description bottom_collection_description"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

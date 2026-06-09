import type { ShopCollection } from '@/lib/shopify/types';
import { imageUrl, imageSrcset } from '@/lib/shopify/image';
import { Icon } from '@/components/snippets/Icon';
import { Breadcrumbs } from '@/components/snippets/Breadcrumbs';

// Translation of:
//   sections/list-collections-template.liquid
//   snippets/collections-grid-item.liquid
//
// Ground truth: tools/output/reference/mirror/collections/index.html
//
// The live site renders with "display_type: all" + "sort: alphabetical" + "grid: 3" +
// "grid_mobile: 1" (from settings_data.json / rendered HTML).
//
// grid_item_width (grid=3, grid_mobile=1) resolves to:
//   "small--one-half tablet--one-third medium-up--one-third mobile--one-whole  small--one-whole"
//
// custom_page_header: no image on this route → plain branch:
//   <div class="page-width"><div class="section-header">
//     <h1 class=" h2 page_header_heading">Колекции</h1>
//     <Breadcrumbs />
//   </div></div>
//
// Translations (locales/bg.json):
//   collections.general.products         → "продукти"
//   collections.general.browse_collections → "Разгледай"
//   homepage.onboarding.collection_title → "Примерна колекция"

const GRID_ITEM_CLASS =
  'zoom-fade-animation-element-wrapper grid__item small--one-half tablet--one-third medium-up--one-third mobile--one-whole  small--one-whole';

const ITEMS_PER_ROW = 3;

function CollectionsGridItem({ collection }: { collection: ShopCollection }) {
  const image = collection.image;
  const collectionUrl = collection.url;
  const paddingTop = image ? `${(1 / image.aspectRatio) * 100}%` : '100%';

  return (
    <div className="collection-grid-item  full_image ">

      <div className="collection-grid-item__image-with-placeholder-wrapper">
        <a href={collectionUrl} className="collection-grid-item__link">
          {image ? (
            <div className="collection-grid-item__image-wrapper">
              <div style={{ paddingTop }}>
                <img
                  src={imageUrl(image.src, 535)}
                  srcSet={imageSrcset(image.src, image.width)}
                  sizes={`(min-width: 750px) calc(100vw / ${ITEMS_PER_ROW}), 100vw`}
                  loading="lazy"
                  width={image.width}
                  height={image.height}
                  className="zoom-fade-animation-element"
                  alt={image.alt || collection.title}
                />
                <div className="load_media_spinner">
                  <div className="rect1"></div>
                  <div className="rect2"></div>
                  <div className="rect3"></div>
                  <div className="rect4"></div>
                  <div className="rect5"></div>
                </div>
              </div>
            </div>
          ) : null}
        </a>
      </div>

      <div className="collection-grid-item__info collections-grid-item__info">
        <div className="collection-grid-item__title h3">
          <a href={collection.title ? collectionUrl : '#'}>
            {collection.title || 'Примерна колекция'}
          </a>
        </div>

        <div className="collection-grid-item-products-count">
          <span> {collection.productsCount} продукти</span>
        </div>
        <div className="collection-grid-item__button_wrapper">
          <a href={collectionUrl} className="btn btn--secondary">
            <span>Разгледай</span>
            <Icon name="tail-right" />
          </a>
        </div>
      </div>

    </div>
  );
}

export function ListCollectionsTemplate({
  collections,
}: {
  collections: ShopCollection[];
}) {
  return (
    // Section wrapper — mirrors rendered HTML:
    //   <div id="shopify-section-…__main" class="shopify-section">
    // wrapping both the page header and the collections grid.
    <div className="shopify-section">
      {/* custom_page_header — no image branch: page-width > section-header > h1 + breadcrumbs */}
      <div className="page-width">
        <div className="section-header">
          <h1 className=" h2 page_header_heading">Колекции</h1>

          <Breadcrumbs
            items={[
              { title: 'Начало', url: '/' },
              { title: 'Колекции', url: '/collections' },
            ]}
          />
        </div>
      </div>

      {/* section wrapper — mirrors rendered HTML:
            <section id="section-{id}" data-section-id="{id}">
              <div class="page-width">
                <ul class="zoom-fade-animation grid grid--uniform list-collections-grid use_align_height zoomFade-animation">
      */}
      <section>
        <div className="page-width">
          <ul className="zoom-fade-animation grid grid--uniform list-collections-grid use_align_height zoomFade-animation">
            {collections.map((collection) => (
              <li key={collection.id} className={GRID_ITEM_CLASS}>
                <CollectionsGridItem collection={collection} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

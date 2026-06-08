import { routes } from '@/config/routes';
import type { Collection } from '@/server/catalog/types';
import {
  gridItemVariants,
  gridVariants,
  pageVariants,
  pageWidthVariants,
} from './CollectionsIndex.styles';
import { CollectionCard } from './components/CollectionCard/CollectionCard';
import { CollectionsHeader } from './components/CollectionsHeader/CollectionsHeader';

export type CollectionsIndexProps = {
  collections: Collection[];
};

/**
 * CollectionsIndex — faithful 1:1 port of `sections/list-collections-template.liquid` for this
 * store's settings (title "Колекции", breadcrumbs on, display full_image, image height 300, grid 3 /
 * grid_mobile 1, sort products_high):
 *
 *   {% render 'custom_page_header' heading:"Колекции" show_breadcrumbs:true %}   (no header image →
 *      plain .section-header: "Колекции" + Начало › Колекции breadcrumbs)
 *   <div class="page-width">
 *     <ul class="grid grid--uniform list-collections-grid use_align_height">
 *       <li class="grid__item small--one-whole tablet--one-third medium-up--one-third">
 *         {% include 'collections-grid-item' %}   (full_image card: image + title + count + "Разгледай")
 *       </li> …
 *     </ul>
 *   </div>
 *
 * Breadcrumbs: `Начало › Колекции` (`snippets/breadcrumbs.liquid`).
 */
export function CollectionsIndex({ collections }: CollectionsIndexProps) {
  const breadcrumbs = [{ label: 'Начало', href: routes.home }, { label: 'Колекции' }];

  return (
    <div className={pageVariants()}>
      <div className={pageWidthVariants()}>
        <CollectionsHeader breadcrumbs={breadcrumbs} />

        <ul className={gridVariants()}>
          {collections.map((collection) => (
            <li key={collection.id} className={gridItemVariants()}>
              <CollectionCard collection={collection} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Text } from '@/design-system/primitives/Text/Text';
import { type BreadcrumbItem, Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { formatProductCount } from '../../utils/count.utils';
import {
  countVariants,
  headerVariants,
  headerWrapperVariants,
  titleBlockVariants,
  titleVariants,
} from './CollectionHeader.styles';

export type CollectionHeaderProps = {
  title: string;
  count: number;
  breadcrumbs: BreadcrumbItem[];
  /** The filters toolbar (grid/list toggle + sort), right-aligned in the header row. */
  toolbar?: ReactNode;
};

// Non-banner collection header — the `.section-header` path of `collection-template.liquid` used
// when the collection has no image (the live `pla-filaments` page):
//   <div class="section-header">
//     {breadcrumbs}                                  (Начало › … pink trail)
//     <div class="section-header-wrapper">
//       <div class="section-header-wrapper-collection">
//         <span class="visually-hidden">Колекция: </span>
//         <h1 class="h2">{collection.title}</h1>
//         <span class="filters-toolbar__product-count">{N продукти}</span>
//       </div>
//       <div class="filters-toolbar">{toggle + sort}</div>
//     </div>
//   </div>
export function CollectionHeader({ title, count, breadcrumbs, toolbar }: CollectionHeaderProps) {
  return (
    <div className={headerVariants()}>
      <Breadcrumbs items={breadcrumbs} />

      <div className={headerWrapperVariants()}>
        <div className={titleBlockVariants()}>
          <Heading as="h1" level="h2" className={titleVariants()}>
            {title}
          </Heading>
          <Text as="span" className={countVariants()}>
            {formatProductCount(count)}
          </Text>
        </div>

        {toolbar}
      </div>
    </div>
  );
}

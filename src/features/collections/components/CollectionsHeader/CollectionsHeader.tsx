import { Heading } from '@/design-system/primitives/Heading/Heading';
import { type BreadcrumbItem, Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { headerVariants, titleVariants } from './CollectionsHeader.styles';

export type CollectionsHeaderProps = {
  breadcrumbs: BreadcrumbItem[];
};

// `custom_page_header.liquid` (no-image branch) for the collections index — the "Колекции" page
// title plus the `Начало › Колекции` breadcrumb trail. The list-collections.json sets the title to
// "Колекции" and no header image, so the plain `.section-header` renders (not a banner).
export function CollectionsHeader({ breadcrumbs }: CollectionsHeaderProps) {
  return (
    <div className={headerVariants()}>
      <Heading as="h1" level="h2" value="Колекции" className={titleVariants()} />
      <Breadcrumbs items={breadcrumbs} />
    </div>
  );
}

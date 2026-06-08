import { GridIcon, ListIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import type { SortKey } from '@/server/catalog/types';
import { SortSelect } from '../SortSelect/SortSelect';
import { layoutButtonVariants, layoutIconClass, toolbarVariants } from './CollectionToolbar.styles';

export type CollectionToolbarProps = {
  sort: SortKey;
};

// `.filters-toolbar` — the grid/list layout toggle (`.collection__layout-button` 49px circles, the
// grid one selected by default like the live store) followed by the sort-by control
// (`.toolbar_sort_by-block`). The product count sits beside the title (rendered by the page), not
// here. 1:1 with `collection-template.liquid` / `custom_page_header.liquid` filters toolbar.
export function CollectionToolbar({ sort }: CollectionToolbarProps) {
  return (
    <div className={toolbarVariants()}>
      <Button
        unstyled
        className={layoutButtonVariants({ selected: true })}
        aria-label="Мрежа"
        aria-pressed
      >
        <GridIcon className={layoutIconClass} />
      </Button>
      <Button
        unstyled
        className={layoutButtonVariants({ selected: false })}
        aria-label="Лист"
        aria-pressed={false}
      >
        <ListIcon className={layoutIconClass} />
      </Button>

      <SortSelect value={sort} />
    </div>
  );
}

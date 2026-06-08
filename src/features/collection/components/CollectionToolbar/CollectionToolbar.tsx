import { Text } from '@/design-system/primitives/Text/Text';
import type { SortKey } from '@/server/catalog/types';
import { formatProductCount } from '../../utils/count.utils';
import { SortSelect } from '../SortSelect/SortSelect';
import { toolbarVariants } from './CollectionToolbar.styles';

export type CollectionToolbarProps = {
  count: number;
  sort: SortKey;
};

// The bar above the product grid: a live product count on the left and the (client) sort control
// on the right, matching the theme's `filters-toolbar` with its count + sort-by select.
export function CollectionToolbar({ count, sort }: CollectionToolbarProps) {
  return (
    <div className={toolbarVariants()}>
      <Text as="span" size="sm" color="muted">
        {formatProductCount(count)}
      </Text>
      <SortSelect value={sort} />
    </div>
  );
}

import { cn } from '@/design-system/lib/cn';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import {
  breadcrumbsCurrent,
  breadcrumbsItem,
  breadcrumbsLink,
  breadcrumbsList,
  breadcrumbsNav,
  breadcrumbsSeparator,
} from './Breadcrumbs.styles';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string | undefined;
};

// 1:1 port of `snippets/breadcrumbs.liquid`:
//   <nav class="breadcrumbs"><ol class="breadcrumbs__list">
//     <li class="breadcrumbs__item"><a class="breadcrumbs__link" href>{label}</a></li> ...
//   </ol></nav>
// The whole trail is pink (#FF1B5C / `text-primary`, `--breadcrumbs_color`); links inherit it.
// Separators are the theme's rotated-border CSS chevron rendered via each non-last item's `::after`.
// The current (last) crumb — or any crumb without an href — is NOT linked and carries
// `aria-current="page"` (matching `.breadcrumbs__link[aria-current="page"]`). The first crumb is
// "Начало" → routes.home, supplied by the caller as the leading item.
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="breadcrumbs" className={cn(breadcrumbsNav(), className)}>
      <ol className={breadcrumbsList()}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = Boolean(item.href) && !isLast;

          return (
            <li
              // The CSS chevron lives on the item's `::after`, so only non-last items get it.
              className={cn(breadcrumbsItem(), isLast ? undefined : breadcrumbsSeparator())}
              key={`${item.label}-${index}`}
            >
              {isLink ? (
                <Link href={item.href ?? '#'} variant="unstyled" className={breadcrumbsLink()}>
                  {item.label}
                </Link>
              ) : (
                <Text
                  as="span"
                  color="current"
                  className={breadcrumbsCurrent()}
                  aria-current="page"
                >
                  {item.label}
                </Text>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

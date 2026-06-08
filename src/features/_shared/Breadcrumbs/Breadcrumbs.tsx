import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
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

// Secondary breadcrumb trail above collection/product/article pages. Linked crumbs are muted and
// turn brand `primary` on hover; the final crumb is the current page (no link, `aria-current`).
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn(breadcrumbsNav(), className)}>
      <ol className={breadcrumbsList()}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${index}`;

          return (
            <Fragment key={key}>
              <li className={breadcrumbsItem()}>
                {item.href && !isLast ? (
                  <Link href={item.href} variant="unstyled" className={breadcrumbsLink()}>
                    {item.label}
                  </Link>
                ) : (
                  <Text
                    as="span"
                    size="sm"
                    color="text"
                    className={breadcrumbsCurrent()}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </Text>
                )}
              </li>
              {!isLast ? (
                <ChevronRight aria-hidden className={breadcrumbsSeparator()} size={14} />
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

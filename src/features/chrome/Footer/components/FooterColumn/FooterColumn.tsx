import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import { footerColumnVariants, footerLinkListVariants } from '../../Footer.styles';

type FooterColumnProps = {
  /** A single menu node — its `label` is the column heading, `children` the links. */
  item: NavItem;
};

// One footer menu column: a heading + a vertical list of links. `href` values come straight
// from the NavItem data (allowed — they're data, not literals), passed to the Link primitive.
export function FooterColumn({ item }: FooterColumnProps) {
  return (
    <div className={footerColumnVariants()}>
      <Text as="h3" size="sm" weight="semibold" color="inverse" value={item.label} />
      {item.children !== undefined && item.children.length > 0 && (
        <ul className={footerLinkListVariants()}>
          {item.children.map((child) => (
            <li key={`${child.label}-${child.href}`}>
              <Link href={child.href} variant="unstyled" className="text-paper hover:text-inverse">
                <Text as="span" size="sm" color="current" value={child.label} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import {
  footerHeadingVariants,
  footerItemVariants,
  footerLinkItemVariants,
  footerLinkListVariants,
  footerLinkVariants,
} from '../../Footer.styles';

type FooterColumnProps = {
  /** A single footer menu node — `label` is the column heading, `children` the link list. */
  item: NavItem;
};

// One footer `link_list` block (e.g. "Бързи Линкове"): a `.h5` white heading (18px) over a
// `ul.site-footer__linklist` of `.cccccc` links. Mirrors `sections/footer.liquid` `link_list`
// branch: `<p class="h5">{title}</p>` + `<ul><li class="site-footer__linklist-item"><a>…</a></li>`.
export function FooterColumn({ item }: FooterColumnProps) {
  return (
    <div className={footerItemVariants()}>
      <div>
        <Text as="p" className={footerHeadingVariants()}>
          {item.label}
        </Text>
        {item.children !== undefined && item.children.length > 0 && (
          <ul className={footerLinkListVariants()}>
            {item.children.map((child) => (
              <li key={`${child.label}-${child.href}`} className={footerLinkItemVariants()}>
                <Link href={child.href} variant="unstyled" className={footerLinkVariants()}>
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

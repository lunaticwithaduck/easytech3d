'use client';

import { useState } from 'react';
import { ChevronRightIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import type { NavItem } from '@/server/catalog/types';
import {
  caretVariants,
  childLinkClass,
  rowClass,
  submenuVariants,
} from './MobileNavAccordion.styles';

type MobileNavAccordionProps = {
  item: NavItem;
  onNavigate: () => void;
};

/**
 * One mobile drawer nav entry (`.mobile-nav__item`): a leaf link, or an expandable group whose
 * children reveal as an indented accordion list. The `chevron-right` caret (pink) rotates open.
 */
export function MobileNavAccordion({ item, onNavigate }: MobileNavAccordionProps) {
  const [open, setOpen] = useState(false);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  if (!hasChildren) {
    return (
      <Link href={item.href} variant="unstyled" className={rowClass} onClick={onNavigate}>
        <Text as="span" size="lg" weight="normal" color="current">
          {item.label}
        </Text>
      </Link>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        unstyled
        className={rowClass}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Text as="span" size="lg" weight="normal" color="current">
          {item.label}
        </Text>
        <ChevronRightIcon className={caretVariants({ open })} />
      </Button>

      <div className={submenuVariants({ open })}>
        <ul>
          {children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                variant="unstyled"
                className={childLinkClass}
                onClick={onNavigate}
              >
                <Text as="span" size="base" color="current">
                  {child.label}
                </Text>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

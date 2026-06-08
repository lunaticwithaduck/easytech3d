'use client';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Icon } from '@/design-system/primitives/Icon/Icon';
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

// One mobile nav entry: a leaf link, or an expandable group listing its children.
export function MobileNavAccordion({ item, onNavigate }: MobileNavAccordionProps) {
  const [open, setOpen] = useState(false);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;

  if (!hasChildren) {
    return (
      <Link href={item.href} variant="unstyled" className={rowClass} onClick={onNavigate}>
        <Text as="span" size="lg" weight="medium" color="current">
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
        <Text as="span" size="lg" weight="medium" color="current">
          {item.label}
        </Text>
        <span className={caretVariants({ open })}>
          <Icon icon={ChevronRight} size={20} />
        </span>
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

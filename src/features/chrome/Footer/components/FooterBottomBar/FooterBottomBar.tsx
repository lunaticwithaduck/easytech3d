import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { FOOTER_COPYRIGHT, FOOTER_POLICY_LINKS } from '../../config/constants';

// Bottom bar: copyright on the left, policy links on the right. Separated from the columns
// above by a faint top border in the inverse palette.
export function FooterBottomBar() {
  return (
    <div className="flex flex-col gap-4 border-t border-muted py-6 sm:flex-row sm:items-center sm:justify-between">
      <Text as="p" size="xs" color="muted" value={FOOTER_COPYRIGHT} />
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {FOOTER_POLICY_LINKS.map((policy) => (
          <li key={policy.href}>
            <Link href={policy.href} variant="unstyled" className="text-muted hover:text-inverse">
              <Text as="span" size="xs" color="current" value={policy.label} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

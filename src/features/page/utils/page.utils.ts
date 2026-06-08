import { PAGE_TITLES, POLICY_TITLES } from '../config/constants';

// Turn a raw slug into a readable title: split on hyphens, capitalise each word.
function humaniseSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function resolvePageTitle(slug: string): string {
  return PAGE_TITLES[slug] ?? humaniseSlug(slug);
}

export function resolvePolicyTitle(slug: string): string {
  return POLICY_TITLES[slug] ?? humaniseSlug(slug);
}

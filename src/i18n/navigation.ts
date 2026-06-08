import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware navigation. Import Link/useRouter/usePathname from here — NEVER from
// next/navigation or next/link directly — so the active locale is always preserved.
export const { Link, useRouter, usePathname, redirect, getPathname } = createNavigation(routing);

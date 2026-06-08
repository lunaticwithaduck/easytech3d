import { defineRouting } from 'next-intl/routing';

// BG-primary store with an EN switch. `always` prefixes every URL with the locale (/bg, /en).
export const routing = defineRouting({
  locales: ['bg', 'en'],
  defaultLocale: 'bg',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

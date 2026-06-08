import { getRequestConfig } from 'next-intl/server';
import { type Locale, routing } from './routing';

// Bundled JSON messages (no backend translation table — divergence from majstorbg, which
// fetched messages from its API). Seed messages/<locale>.json from the captured reference copy.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

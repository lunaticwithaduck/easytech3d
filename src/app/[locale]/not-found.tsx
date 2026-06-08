import { NotFound } from '@/features/not-found/NotFound';

// Locale-scoped 404. Next renders this inside `[locale]/layout.tsx`, which already calls
// setRequestLocale and provides the NextIntlClientProvider, so the Text primitive resolves
// here without this file receiving `params` (not-found files don't get route props).
export default function NotFoundPage() {
  return <NotFound />;
}

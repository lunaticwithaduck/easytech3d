import { DATE_LOCALE } from '../config/constants';

// Formats an ISO publish date the way the Liquid `time_tag: format: 'date'` does — a long,
// localized day/month/year (e.g. "15 март 2024 г."). Falls back to the raw string if unparseable.
export function formatArticleDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

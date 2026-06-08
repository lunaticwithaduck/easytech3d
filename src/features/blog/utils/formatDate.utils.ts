// Formats an ISO publish date the way the live theme's `time_tag: format: 'date'` renders it on
// the blog index — a long English day/month/year (e.g. "July 29, 2024"). A fixed locale + UTC keeps
// server/client output identical (no hydration drift); the month names aren't user-facing copy.
export function formatArticleDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

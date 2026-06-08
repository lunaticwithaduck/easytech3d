// Formats an ISO publish date into the long English form the live theme renders in the article
// meta line (e.g. "March 06, 2025"). A fixed locale keeps server/client output identical and
// avoids hydration drift; the day/month names are not user-facing copy, so they bypass i18n.
export function formatArticleDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

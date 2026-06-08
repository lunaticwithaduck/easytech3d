// Format an ISO date as a BG long date (e.g. "15 март 2024 г."). Deterministic — uses a fixed
// bg-BG locale so server and client render identically (no hydration drift).
export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

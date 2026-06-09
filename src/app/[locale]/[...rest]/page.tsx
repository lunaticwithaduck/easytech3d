import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

// Catch-all for any unmatched paths under /[locale]/* so unknown URLs render the branded
// not-found.tsx (with header/footer chrome) instead of Next.js's bare default 404.
// Returns [] for generateStaticParams — no paths are pre-rendered; all hits are handled at
// runtime by immediately calling notFound().

type Props = {
  params: Promise<{ locale: string; rest: string[] }>;
};

export function generateStaticParams() {
  return [];
}

export default async function CatchAllRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}

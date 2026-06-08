import { setRequestLocale } from 'next-intl/server';
import { Home } from '@/features/home/Home';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Home />;
}

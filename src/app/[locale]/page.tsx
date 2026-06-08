import { setRequestLocale } from 'next-intl/server';
import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { TextPrice } from '@/design-system/primitives/Text/TextPrice';
import { routes } from '@/config/routes';

// Copy keys live in a *_COPY constant; <Text value=…> resolves them through the i18n pipeline.
const HOME_COPY = {
  eyebrow: 'Home.eyebrow',
  title: 'Home.title',
  subtitle: 'Home.subtitle',
  ctaShop: 'Home.ctaShop',
  ctaCollections: 'Home.ctaCollections',
} as const;

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Text as="span" size="sm" weight="semibold" color="primary" value={HOME_COPY.eyebrow} />
      <Text as="h1" size="6xl" weight="bold" value={HOME_COPY.title} />
      <Text as="p" size="lg" color="muted" value={HOME_COPY.subtitle} />

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href={routes.collections} variant="unstyled">
            <Text as="span" color="current" value={HOME_COPY.ctaShop} />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={routes.collection('filaments')} variant="unstyled">
            <Text as="span" color="current" value={HOME_COPY.ctaCollections} />
          </Link>
        </Button>
      </div>

      <TextPrice amount={24.9} currency="BGN" size="xl" />
    </main>
  );
}

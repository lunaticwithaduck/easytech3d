// Translation of sections/main-404.liquid — migrated to design-system primitives.
//
// Ground truth: tools/output/reference/mirror/404-page-not-found-reference/index.html lines 1571–1593.
// Layout: centered Container, subtitle (Text h3-level), big "404" Heading (h1), two Button pills
// (primary → home, outline → contact), copyright footer.
// No theme class names; styling exclusively from @theme tokens + design-system primitives.

import { Button, Container, Heading, Link, Text } from '@/design-system';
import { shop } from '@/data/settings';

export function Page404() {
  const year = new Date().getFullYear();

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Text
        as="p"
        size="eyebrow"
        color="muted"
        className="mb-4"
        value="Страницата не е намерена ;("
      />

      <Heading as="h1" level={1} className="mb-8">
        Страница 404
      </Heading>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button variant="primary" asChild>
          <Link href="/">Обратно в начало</Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/pages/contact">Свържете се с нас!</Link>
        </Button>
      </div>

      <p className="mt-12 text-xs text-ink/50">
        &copy; {year},{' '}
        <Link href="/" className="hover:text-ink/80">
          {shop.name}
        </Link>
      </p>
    </Container>
  );
}

import { Button } from '@/design-system/primitives/Button/Button';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { routes } from '@/config/routes';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { NotFoundSearch } from './components/NotFoundSearch/NotFoundSearch';
import {
  notFoundActionsClass,
  notFoundCodeClass,
  notFoundEyebrowClass,
  notFoundMessageClass,
  notFoundWrapperClass,
} from './NotFound.styles';

/**
 * 404 page body — mirrors the Shopify `main-404` section: eyebrow, mega "404", a friendly BG
 * message, primary "back home" + secondary "contact" CTAs, and a search affordance. The
 * header/footer come from the locale layout, so this only renders the centred content band.
 */
export function NotFound() {
  return (
    <Section>
      <Container size="narrow">
        <div className={notFoundWrapperClass}>
          <Text
            as="span"
            color="primary"
            size="sm"
            weight="semibold"
            className={notFoundEyebrowClass}
            value="Опа! Нещо липсва"
          />
          <Text as="span" className={notFoundCodeClass} value="404" />
          <Text as="h1" size="3xl" weight="bold" color="text" value="Страницата не е намерена" />
          <Text
            as="p"
            size="lg"
            color="muted"
            className={notFoundMessageClass}
            value="Изглежда, че страницата, която търсите, не съществува или е била преместена."
          />

          <NotFoundSearch />

          <div className={notFoundActionsClass}>
            <Button asChild variant="primary" size="lg">
              <Link href={routes.home} variant="unstyled">
                Към началната страница
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={routes.contact} variant="unstyled">
                Свържете се с нас
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}

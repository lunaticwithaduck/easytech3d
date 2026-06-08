import { routes } from '@/config/routes';
import { Button } from '@/design-system/primitives/Button/Button';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Link } from '@/design-system/primitives/Link/Link';
import { Text } from '@/design-system/primitives/Text/Text';
import { Section } from '@/features/_shared/Section/Section';
import {
  notFoundActionsClass,
  notFoundFooterClass,
  notFoundSuptitleClass,
  notFoundTitleClass,
  notFoundWrapperClass,
} from './NotFound.styles';

const COPYRIGHT_YEAR = new Date().getFullYear();

/**
 * 404 page body — 1:1 with the Shopify `main-404.liquid` section. Inside
 * `.page-width-small > .empty-page-content.text-left.page-404-content`:
 *   • h3 suptitle "Страницата не е намерена ;(" (#232323)
 *   • h1 `.mega-title--large` "Страница 404" (the big pink #ff1b5c numeral title)
 *   • `.btn_wrapper`: primary CTA "Обратно в начало" → routes.home,
 *     transparent_secondary CTA "Свържете се с нас!" → routes.contact
 *   • `.page-404-footer`: copyright "© {year}, easytech3d"
 * Each theme CTA wraps its label in a `<span>` and links via `href`; here that's a `Button asChild`
 * carrying the `.btn` classes over a `Link`. Header/footer come from the locale layout, so this
 * renders only the page-width-small content band.
 */
export function NotFound() {
  return (
    <Section background="default">
      <div className={notFoundWrapperClass}>
        <Heading as="h3" level="h3" className={notFoundSuptitleClass} value="Страницата не е намерена ;(" />
        <Heading as="h1" level="h1" className={notFoundTitleClass} value="Страница 404" />

        <div className={notFoundActionsClass}>
          <Button asChild variant="primary">
            <Link href={routes.home} variant="unstyled">
              <Text as="span" color="current" value="Обратно в начало" />
            </Link>
          </Button>
          <Button asChild variant="transparent_secondary">
            <Link href={routes.contact} variant="unstyled">
              <Text as="span" color="current" value="Свържете се с нас!" />
            </Link>
          </Button>
        </div>

        <div className={notFoundFooterClass}>
          <Text as="span" color="muted" value="© {year}, easytech3d" params={{ year: COPYRIGHT_YEAR }} />
        </div>
      </div>
    </Section>
  );
}

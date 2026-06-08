import { Text } from '@/design-system/primitives/Text/Text';
import { routes } from '@/config/routes';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { PLACEHOLDER_PARAGRAPHS } from './config/constants';
import { pageHeaderClass, pageProseClass } from './PageContent.styles';

export type PageContentProps = {
  /** Already-resolved page title (runtime string, rendered as Text children). */
  title: string;
};

// Generic titled content page: a page header (breadcrumb trail + H1) followed by placeholder
// prose. Mirrors the Liquid `main-page` section (custom_page_header + `.rte` page content).
export function PageContent({ title }: PageContentProps) {
  return (
    <main>
      <Section background="white">
        <Container size="narrow">
          <div className={pageHeaderClass}>
            <Breadcrumbs items={[{ label: 'Начало', href: routes.home }, { label: title }]} />
            <Text as="h1" size="4xl" weight="bold">
              {title}
            </Text>
          </div>

          <div className={pageProseClass}>
            {PLACEHOLDER_PARAGRAPHS.map((paragraph) => (
              <Text key={paragraph} as="p" size="base" color="muted">
                {paragraph}
              </Text>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}

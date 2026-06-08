import { routes } from '@/config/routes';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { HOME_BREADCRUMB } from './config/constants';
import {
  pageBodyClass,
  pageHeaderClass,
  pageHeadingClass,
  pageRteClass,
} from './PageContent.styles';

export type PageContentProps = {
  /** Already-resolved page title (runtime string, rendered as the `page_header_heading` H1). */
  title: string;
  /** Server-rendered `page.content` rich-text HTML, injected into the `.rte` block. */
  contentHtml: string;
};

// Generic titled content page — faithful to `sections/main-page.liquid`. With no header image set
// in config it renders the `custom_page_header` "no image" branch: a `.page-width > .section-header`
// with the `page_header_heading` H1 (h2 visual scale) + breadcrumbs, then the `.rte` page content
// inside a centered ~750px column (`.grid__item.medium-up--five-sixths.medium-up--push-one-twelfth`).
export function PageContent({ title, contentHtml }: PageContentProps) {
  return (
    <main>
      <Section background="default">
        <Container>
          <div className={pageHeaderClass}>
            <Heading as="h1" level="h2" className={pageHeadingClass}>
              {title}
            </Heading>
            <Breadcrumbs
              items={[{ label: HOME_BREADCRUMB, href: routes.home }, { label: title }]}
            />
          </div>

          <div className={pageBodyClass}>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: server-rendered page.content RTE (R3). */}
            <div className={pageRteClass} dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        </Container>
      </Section>
    </main>
  );
}

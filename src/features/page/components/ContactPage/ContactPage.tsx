import { routes } from '@/config/routes';
import { Heading } from '@/design-system/primitives/Heading/Heading';
import { Text } from '@/design-system/primitives/Text/Text';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { getPageContent, HOME_BREADCRUMB } from '../../config/constants';
import {
  contactPageBodyClass,
  contactPageHeaderClass,
  contactPageHeadingClass,
  contactPageRteClass,
  contactSectionClass,
} from './ContactPage.styles';
import { ContactForm } from './ContactForm';
import {
  contactEyebrowClass,
  contactHeaderBlockClass,
  contactSubheadingClass,
} from './ContactSection.styles';

// Contact page (`page.contact.json`): the `main-page` section (page header "Контакти" + breadcrumbs
// + RTE page content) followed by the `page-contact` section — a centered section-header
// (eyebrow "Пратете ни мейл" / title "Свържете се с нас" / subheading "Въпроси по мейла") and the
// contact form. The two DISABLED sections (index-icons, slideshow) are not rendered.
export function ContactPage() {
  const title = 'Контакти';

  return (
    <main>
      <Section background="default">
        <Container>
          {/* main-page: header + RTE content */}
          <div className={contactPageHeaderClass}>
            <Heading as="h1" level="h2" className={contactPageHeadingClass}>
              {title}
            </Heading>
            <Breadcrumbs
              items={[{ label: HOME_BREADCRUMB, href: routes.home }, { label: title }]}
            />
          </div>

          <div className={contactPageBodyClass}>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: server-rendered page.content RTE (R3). */}
            <div
              className={contactPageRteClass}
              dangerouslySetInnerHTML={{ __html: getPageContent('contact') }}
            />
          </div>

          {/* page-contact: centered section-header + form */}
          <div className={contactSectionClass}>
            <div className={contactHeaderBlockClass}>
              <Text as="span" className={contactEyebrowClass} value="Пратете ни мейл" />
              <Heading as="h2" level="h2" value="Свържете се с нас" />
              <Text as="p" className={contactSubheadingClass} value="Въпроси по мейла" />
            </div>

            <ContactForm />
          </div>
        </Container>
      </Section>
    </main>
  );
}

import { Mail, MapPin, Phone } from 'lucide-react';
import { Icon } from '@/design-system/primitives/Icon/Icon';
import { Text } from '@/design-system/primitives/Text/Text';
import { routes } from '@/config/routes';
import { Breadcrumbs } from '@/features/_shared/Breadcrumbs/Breadcrumbs';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { ContactForm } from './ContactForm';
import {
  contactGridClass,
  contactHeaderClass,
  contactInfoItemClass,
  contactInfoListClass,
  contactInfoTextClass,
} from './ContactPage.styles';

const CONTACT_DETAILS = [
  { icon: Mail, label: 'Имейл', value: 'info@easytech3d.com' },
  { icon: Phone, label: 'Телефон', value: '+359 88 888 8888' },
  { icon: MapPin, label: 'Адрес', value: 'гр. София, ул. Примерна 1' },
] as const;

// Contact page: page header (breadcrumbs + heading "Контакти"), a two-column layout with the
// contact form on the left and contact-info placeholders on the right. Mirrors `page-contact`.
export function ContactPage() {
  return (
    <main>
      <Section background="white">
        <Container>
          <div className={contactHeaderClass}>
            <Breadcrumbs items={[{ label: 'Начало', href: routes.home }, { label: 'Контакти' }]} />
            <Text as="h1" size="4xl" weight="bold" value="Контакти" />
            <Text
              as="p"
              size="base"
              color="muted"
              value="Попълнете формата по-долу и ще се свържем с вас в рамките на 24 часа."
            />
          </div>

          <div className={contactGridClass}>
            <ContactForm />

            <div className={contactInfoListClass}>
              <Text as="h2" size="xl" weight="semibold" value="Свържете се с нас" />
              {CONTACT_DETAILS.map((detail) => (
                <div key={detail.label} className={contactInfoItemClass}>
                  <Icon icon={detail.icon} size={22} className="text-primary" />
                  <div className={contactInfoTextClass}>
                    <Text as="span" size="sm" weight="semibold" color="text" value={detail.label} />
                    <Text as="span" size="base" color="muted">
                      {detail.value}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Text } from '@/design-system/primitives/Text/Text';
import { Container } from '@/features/_shared/Container/Container';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import { HOME_COPY } from '../../config/constants';
import {
  newsletterFormClass,
  newsletterInputClass,
  newsletterRootClass,
} from './NewsletterSection.styles';

export type NewsletterConfig = {
  title: string;
  subheading: string;
};

export type NewsletterSectionProps = {
  config: NewsletterConfig;
};

// "Абонирайте се към нашият мейл лист": an elevated band with a heading, subheading, and an
// inline email field. Submit is a no-op stub this session — it flips a local flag to acknowledge.
export function NewsletterSection({ config }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim() === '') return;
    setSubscribed(true);
    setEmail('');
  }

  return (
    <Section background="muted">
      <Container>
        <div className={newsletterRootClass}>
          <SectionHeading title={config.title} align="center" />
          <Text as="p" size="base" color="muted">
            {config.subheading}
          </Text>

          <form onSubmit={handleSubmit} className={newsletterFormClass}>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={HOME_COPY.newsletterPlaceholder}
              aria-label={HOME_COPY.newsletterAria}
              autoComplete="email"
              className={newsletterInputClass}
            />
            <Button type="submit" variant="primary" size="lg">
              {HOME_COPY.newsletterCta}
            </Button>
          </form>

          {subscribed ? (
            <Text as="p" size="sm" color="success" value={HOME_COPY.newsletterSuccess} />
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

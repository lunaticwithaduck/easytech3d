'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Text } from '@/design-system/primitives/Text/Text';
import { Section } from '@/features/_shared/Section/Section';
import { SectionHeading } from '@/features/_shared/SectionHeading/SectionHeading';
import {
  btnWrapperClass,
  formClass,
  formInputClass,
  inputGroupClass,
  nameGridClass,
  nameGridItemClass,
  pageWidthSmallClass,
  sectionHeaderClass,
  successMessageClass,
} from './NewsletterSection.styles';

export type NewsletterConfig = {
  title: string;
  subheading: string;
};

export type NewsletterSectionProps = {
  config: NewsletterConfig;
};

// Faithful 1:1 port of `sections/newsletter.liquid` (home instance, showFormLabels: true):
//   .newsletter-section > .page-width-small
//     > .section-header.text-center  ( h2 title + .rte subheading )
//     > form 'customer'.contact-form.form-single-field
//         .grid.grid--half-gutters   ( Първо име / Фамилно име )
//         .input-group               ( Имейл )
//         .input-group__btn-wrapper  ( submit "Подай" + tail-right arrow )
// The real form POSTs to Shopify's `customer` endpoint; in this port the submit is a no-op stub
// ('use client', preventDefault) that flips a local flag to show the confirmation message.
export function NewsletterSection({ config }: NewsletterSectionProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim() === '') return;
    setSubscribed(true);
    setFirstName('');
    setLastName('');
    setEmail('');
  }

  return (
    <Section>
      <div className={pageWidthSmallClass}>
        {/* .section-header.text-center — title (h2) + .rte subheading under one bottom margin */}
        <div className={sectionHeaderClass}>
          <SectionHeading title={config.title} align="center" className="mb-0" />
          <Text as="p" color="muted">
            {config.subheading}
          </Text>
        </div>

        <form onSubmit={handleSubmit} className={formClass}>
          {/* .grid.grid--half-gutters → Първо име / Фамилно име */}
          <div className={nameGridClass}>
            <div className={nameGridItemClass}>
              <Input
                type="text"
                name="first_name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Първо име"
                aria-label="Първо име"
                autoComplete="given-name"
                className={formInputClass}
              />
            </div>
            <div className={nameGridItemClass}>
              <Input
                type="text"
                name="last_name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Фамилно име"
                aria-label="Фамилно име"
                autoComplete="family-name"
                className={formInputClass}
              />
            </div>
          </div>

          {/* .input-group → email field */}
          <div className={inputGroupClass}>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Имейл"
              aria-label="Имейл"
              autoComplete="email"
              className={formInputClass}
            />
          </div>

          {/* .input-group__btn-wrapper → submit "Подай" with trailing tail-right arrow */}
          <span className={btnWrapperClass}>
            <Button type="submit" variant="primary" iconRight>
              Подай
            </Button>
          </span>

          {subscribed ? (
            <Text
              as="p"
              size="sm"
              color="success"
              className={successMessageClass}
              value="Благодарим за абонирането!"
            />
          ) : null}
        </form>
      </div>
    </Section>
  );
}

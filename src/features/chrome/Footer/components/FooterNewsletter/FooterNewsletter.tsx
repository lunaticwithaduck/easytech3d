'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Text } from '@/design-system/primitives/Text/Text';
import {
  FOOTER_NEWSLETTER_CTA,
  FOOTER_NEWSLETTER_PLACEHOLDER,
  FOOTER_NEWSLETTER_TEXT,
  FOOTER_NEWSLETTER_TITLE,
} from '../../config/constants';
import { footerColumnVariants } from '../../Footer.styles';

// Newsletter signup. Submit is a no-op stub this session (the backend comes next); it just
// flips a local "subscribed" flag so the UI acknowledges the action.
export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim() === '') return;
    setSubscribed(true);
    setEmail('');
  }

  return (
    <div className={footerColumnVariants()}>
      <Text as="h3" size="sm" weight="semibold" color="inverse" value={FOOTER_NEWSLETTER_TITLE} />
      <Text as="p" size="sm" color="paper" value={FOOTER_NEWSLETTER_TEXT} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={FOOTER_NEWSLETTER_PLACEHOLDER}
          aria-label={FOOTER_NEWSLETTER_PLACEHOLDER}
          className="sm:flex-1"
        />
        <Button type="submit" variant="primary" size="md">
          {FOOTER_NEWSLETTER_CTA}
        </Button>
      </form>
      {subscribed && (
        <Text as="p" size="xs" color="success" value="Благодарим! Абонаментът Ви е регистриран." />
      )}
    </div>
  );
}

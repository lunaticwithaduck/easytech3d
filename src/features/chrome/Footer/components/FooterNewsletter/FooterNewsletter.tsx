'use client';

import { type FormEvent, useState } from 'react';
import { CheckIcon } from '@/design-system/icons';
import { Button } from '@/design-system/primitives/Button/Button';
import { Input } from '@/design-system/primitives/Input/Input';
import { Text } from '@/design-system/primitives/Text/Text';
import {
  FOOTER_NEWSLETTER_CONFIRMATION,
  FOOTER_NEWSLETTER_PLACEHOLDER,
  FOOTER_NEWSLETTER_TEXT,
  FOOTER_NEWSLETTER_TITLE,
} from '../../config/constants';
import {
  footerHeadingVariants,
  footerItemVariants,
  footerNewsletterFormVariants,
  footerNewsletterInputVariants,
  footerNewsletterSubmitVariants,
  footerRteVariants,
} from '../../Footer.styles';

// Optional footer `newsletter` block (disabled on the live store, off by default here). Mirrors
// `sections/footer.liquid` newsletter branch: `.h5` title + `.site-footer__rte` + a `customer`
// form `.input-group` with a pill `newsletter__input` and a circular `newsletter__submit` (the
// `check` icon, 49×49 #ff1b5c). Submit is a local no-op stub this session.
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
    <div className={footerItemVariants()}>
      <div>
        <Text as="p" className={footerHeadingVariants()}>
          {FOOTER_NEWSLETTER_TITLE}
        </Text>
        <Text as="p" className={footerRteVariants()}>
          {FOOTER_NEWSLETTER_TEXT}
        </Text>
        <form onSubmit={handleSubmit} className={footerNewsletterFormVariants()}>
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={FOOTER_NEWSLETTER_PLACEHOLDER}
            aria-label={FOOTER_NEWSLETTER_PLACEHOLDER}
            required
            className={footerNewsletterInputVariants()}
          />
          <Button
            type="submit"
            variant="primary"
            aria-label={FOOTER_NEWSLETTER_PLACEHOLDER}
            className={footerNewsletterSubmitVariants()}
          >
            <CheckIcon className="size-[20px]" aria-hidden />
          </Button>
        </form>
        {subscribed && (
          <Text as="p" className={footerRteVariants()} value={FOOTER_NEWSLETTER_CONFIRMATION} />
        )}
      </div>
    </div>
  );
}

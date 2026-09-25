'use client';

import { useState } from 'react';
import { subscribeNewsletter } from '@/actions/forms';
import { Rte } from '@/components/snippets/Rte';
import type { newsletterSection } from '@/data/home';
import { Button, Container, Icon, Input, Section, SectionHeader, Text } from '@/design-system';

type NewsletterSection = typeof newsletterSection;

// Translated from tools/output/liquid-template/sections/newsletter.liquid.
// Wired to the backend newsletter endpoint via a Server Action (subscribeNewsletter).

const FORM_ID = 'Contact_newsletter';

export function Newsletter({ section }: { section: NewsletterSection }) {
  const { title, subtitle, subheadingHtml } = section;
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('contact[email]') ?? '').trim();
    if (!email) {
      setError('Моля, въведете имейл.');
      return;
    }
    setStatus('sending');
    const res = await subscribeNewsletter(
      email,
      String(fd.get('contact[first_name]') ?? '').trim() || undefined,
      String(fd.get('contact[last_name]') ?? '').trim() || undefined,
    );
    if (res.ok) setStatus('done');
    else {
      setStatus('idle');
      setError(res.error);
    }
  }

  return (
    <Section id="section-newsletter">
      <Container>
        {/* Heading spans the full Container width on one line (SectionHeader is already centered);
            only the form below is a narrow centered band (~600px), matching live. */}
        {(subtitle || title) && (
          <SectionHeader eyebrow={subtitle || undefined} title={title || undefined} />
        )}

        {subheadingHtml && (
          <div className="mb-8 text-center">
            <Rte html={subheadingHtml} className="text-ink/70" />
          </div>
        )}

        {status === 'done' ? (
          <Text
            as="p"
            weight="bold"
            className="mx-auto max-w-[600px] text-center text-success"
            value="Благодарим! Записахме Ви за нашия бюлетин. 🎉"
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            id={FORM_ID}
            acceptCharset="UTF-8"
            className="mx-auto flex w-full max-w-[600px] flex-col gap-4"
          >
            <input type="hidden" name="contact[tags]" value="newsletter" />

            {/* Row 1 — first name + last name, 2-up on sm+ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${FORM_ID}-first-name`} className="sr-only">
                  Първо име
                </label>
                <Input
                  type="text"
                  name="contact[first_name]"
                  id={`${FORM_ID}-first-name`}
                  placeholder="Първо име"
                  aria-label="Първо име"
                  autoComplete="given-name"
                  autoCorrect="off"
                  autoCapitalize="words"
                />
              </div>
              <div>
                <label htmlFor={`${FORM_ID}-last-name`} className="sr-only">
                  Фамилно име
                </label>
                <Input
                  type="text"
                  name="contact[last_name]"
                  id={`${FORM_ID}-last-name`}
                  placeholder="Фамилно име"
                  aria-label="Фамилно име"
                  autoComplete="family-name"
                  autoCorrect="off"
                  autoCapitalize="words"
                />
              </div>
            </div>

            {/* Row 2 — full-width email */}
            <div>
              <label htmlFor={`${FORM_ID}-email`} className="sr-only">
                Имейл
              </label>
              <Input
                type="email"
                name="contact[email]"
                id={`${FORM_ID}-email`}
                placeholder="Имейл"
                aria-label="Имейл"
                aria-required="true"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            {error && <Text as="p" size="sm" className="text-center text-sale" value={error} />}

            {/* Row 3 — pink submit, centered inside the narrow band */}
            <div className="flex justify-center">
              <Button type="submit" variant="primary" name="commit" disabled={status === 'sending'}>
                <Text
                  as="span"
                  weight="bold"
                  color="white"
                  value={status === 'sending' ? 'Изпращане…' : 'Подай'}
                />
                <Icon name="tail-right" className="size-4 shrink-0" />
              </Button>
            </div>
          </form>
        )}
      </Container>
    </Section>
  );
}

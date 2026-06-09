'use client';

import { Button, Container, Icon, Input, Section, SectionHeader, Text } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';
import { newsletterSection } from '@/data/home';

type NewsletterSection = typeof newsletterSection;

// Translated from tools/output/liquid-template/sections/newsletter.liquid
// Markup confirmed against tools/output/reference/mirror/index.html (lines 12803–12861).
// BG strings inlined from locales/bg.json / mirror HTML ground-truth.
// No backend: form action="#", static markup only.

const FORM_ID = 'Contact_newsletter';

export function Newsletter({ section }: { section: NewsletterSection }) {
  const { title, subtitle, subheadingHtml } = section;

  return (
    <Section id="section-newsletter">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {(subtitle || title) && (
            <SectionHeader eyebrow={subtitle || undefined} title={title || undefined} />
          )}

          {subheadingHtml && (
            <div className="mb-8">
              <Rte html={subheadingHtml} className="text-ink/70" />
            </div>
          )}

          <form
            method="post"
            action="#"
            id={FORM_ID}
            acceptCharset="UTF-8"
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <input type="hidden" name="contact[tags]" value="newsletter" />

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
              autoCorrect="off"
              autoCapitalize="off"
              className="w-full sm:w-72"
            />

            <Button type="submit" variant="primary" name="commit">
              <Text as="span" weight="bold" color="white" value="Абонирай се" />
              <Icon name="tail-right" className="size-4 shrink-0" />
            </Button>
          </form>
        </div>
      </Container>
    </Section>
  );
}

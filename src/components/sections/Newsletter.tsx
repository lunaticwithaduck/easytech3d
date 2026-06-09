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
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="contact[tags]" value="newsletter" />

            {/* Row 1 — first name + last name, 2-up on sm+ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${FORM_ID}-first-name`} className="sr-only">
                  Собствено Ime
                </label>
                <Input
                  type="text"
                  name="contact[first_name]"
                  id={`${FORM_ID}-first-name`}
                  placeholder="Собствено Ime"
                  aria-label="Собствено Ime"
                  autoComplete="given-name"
                  autoCorrect="off"
                  autoCapitalize="words"
                />
              </div>
              <div>
                <label htmlFor={`${FORM_ID}-last-name`} className="sr-only">
                  Фамилия
                </label>
                <Input
                  type="text"
                  name="contact[last_name]"
                  id={`${FORM_ID}-last-name`}
                  placeholder="Фамилия"
                  aria-label="Фамилия"
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

            {/* Row 3 — pink submit, left-aligned inside the centred band */}
            <div className="flex justify-center">
              <Button type="submit" variant="primary" name="commit">
                <Text as="span" weight="bold" color="white" value="Подай" />
                <Icon name="tail-right" className="size-4 shrink-0" />
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </Section>
  );
}

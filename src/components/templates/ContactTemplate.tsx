// Translation of sections/main-page.liquid + sections/page-contact.liquid
// (template config templates/page.contact.json).
//
// Renders two shopify-sections worth of markup:
//   Section 1 (main-page.liquid) — page header + rte body content (same as PageTemplate).
//   Section 2 (page-contact.liquid) — contact form:
//     .page-width > .grid > .grid__item.medium-up--five-sixths.medium-up--push-one-twelfth
//       > .section-header.text-center  (subtitle h5 + h2 + subheading rte)
//       > .contact-form.form-vertical
//           form#ContactForm
//             grid row: name + email
//             phone (hidden per inline style on live site, included for fidelity)
//             message textarea
//             submit .btn.btn--primary with tail-right icon
//
// Ground truth: tools/output/reference/mirror/pages/contact/index.html lines 1619–1692.
// BG strings come from tools/output/liquid-template/locales/bg.json:
//   contact.form.name = "Име"
//   contact.form.email = "Имейл"
//   contact.form.phone = "Телефонен Номер"
//   contact.form.message = "Съобщение"
//   contact.form.submit = "Прати"

import { Button, Container, Heading, Icon, Input, Link, Section, SectionHeader, Text, Textarea } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';

function Breadcrumbs({ items }: { items: { title: string; url?: string }[] }) {
  return (
    <nav aria-label="breadcrumbs" className="mb-5 flex flex-wrap items-center gap-2">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.title}-${i}`} className="flex items-center gap-2">
            {item.url && !last ? (
              <Link href={item.url} className="text-sm text-primary hover:underline">
                {item.title}
              </Link>
            ) : (
              <Text as="span" size="sm" color="primary" value={item.title} />
            )}
            {!last && <Text as="span" size="sm" color="primary" value="›" />}
          </span>
        );
      })}
    </nav>
  );
}

export function ContactTemplate({
  title,
  contentHtml,
}: {
  title: string;
  contentHtml: string;
}) {
  const breadcrumbItems = [
    { title: 'Начало', url: '/' },
    { title },
  ];

  return (
    <>
      {/* ── Section 1: main-page.liquid — custom_page_header (no image) + rte body ── */}
      <Container as="header" className="pt-8 md:pt-12">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-8 border-b border-border pb-5">
          <Heading as="h1" level={2}>
            {title}
          </Heading>
        </div>
      </Container>

      <Container className="pb-14">
        {/* mirrors medium-up--five-sixths / push-one-twelfth: five-sixths width, one-twelfth left offset */}
        <div className="w-5/6 ml-[8.333%]">
          <Rte html={contentHtml} />
        </div>
      </Container>

      {/* ── Section 2: page-contact.liquid — contact form section ── */}
      <Section>
        <Container>
          <div className="w-5/6 ml-[8.333%]">
            {/* section-header: subtitle (h5) + title (h2) + subheading */}
            <SectionHeader eyebrow="Пратете ни мейл" title="Свържете се с нас" />

            <p className="mb-8 text-center text-base text-ink/70">Въпроси по мейла</p>

            {/* contact form */}
            <form
              method="post"
              action="#"
              id="ContactForm"
              acceptCharset="UTF-8"
              className="flex flex-col gap-6"
            >
              {/* Name + Email row — 2-up on md+ */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="ContactForm-name" className="text-sm font-bold text-ink">
                    Име<span aria-hidden="true"> *</span>
                  </label>
                  <Input
                    type="text"
                    id="ContactForm-name"
                    name="contact[Име]"
                    aria-required="true"
                    required
                    defaultValue=""
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="ContactForm-email" className="text-sm font-bold text-ink">
                    Имейл<span aria-hidden="true"> *</span>
                  </label>
                  <Input
                    type="email"
                    id="ContactForm-email"
                    name="contact[email]"
                    autoCorrect="off"
                    autoCapitalize="off"
                    defaultValue=""
                    aria-required="true"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="ContactForm-message" className="text-sm font-bold text-ink">
                  Съобщение<span aria-hidden="true"> *</span>
                </label>
                <Textarea
                  rows={10}
                  required
                  aria-required="true"
                  id="ContactForm-message"
                  name="contact[Съобщение]"
                />
              </div>

              {/* Submit */}
              <div>
                <Button type="submit" variant="primary">
                  <Text as="span" weight="bold" color="white" value="Прати" />
                  <Icon name="tail-right" className="size-4 shrink-0" />
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    </>
  );
}

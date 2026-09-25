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

import { Rte } from '@/components/snippets/Rte';
import { Container, Heading, Link, Section, SectionHeader, Text } from '@/design-system';
import { ContactForm } from './ContactForm';

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

export function ContactTemplate({ title, contentHtml }: { title: string; contentHtml: string }) {
  const breadcrumbItems = [{ title: 'Начало', url: '/' }, { title }];

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

            <ContactForm />
          </div>
        </Container>
      </Section>
    </>
  );
}

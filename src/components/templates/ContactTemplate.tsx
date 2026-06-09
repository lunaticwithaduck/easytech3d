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

import { Breadcrumbs } from '@/components/snippets/Breadcrumbs';
import { Icon } from '@/components/snippets/Icon';
import { Rte } from '@/components/snippets/Rte';

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
      <div className="page-width">
        <div className="section-header">
          <h1 className=" h2 page_header_heading">{title}</h1>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      <div className="page-width">
        <div className="grid">
          <div className="grid__item medium-up--five-sixths medium-up--push-one-twelfth">
            <Rte html={contentHtml} />
          </div>
        </div>
      </div>

      {/* ── Section 2: page-contact.liquid — contact form section ── */}
      {/* The live theme applies class="padding-section index-section page-contact-section"
          to the shopify-section wrapper; we inline the inner markup directly. */}
      <section className="">
        <div className="page-width">
          <div className="grid">
            <div className="grid__item medium-up--five-sixths medium-up--push-one-twelfth">
              {/* section-header: subtitle (h5) + title (h2) + subheading (rte) */}
              <div className="section-header text-center homepage_subtitle_style_match_header">
                <span className="h5">Пратете ни мейл</span>
                <h2 className="h2">Свържете се с нас</h2>
                <div className="rte">
                  <p>Въпроси по мейла</p>
                </div>
              </div>

              {/* contact form */}
              <div className="contact-form form-vertical">
                {/* action="#" keeps the form inert (no real backend wired yet) */}
                <form
                  method="post"
                  action="#"
                  id="ContactForm"
                  acceptCharset="UTF-8"
                  className="contact-form"
                >
                  {/* Name + Email row */}
                  <div className="grid grid--half-gutters">
                    <div className="grid__item medium-up--one-half">
                      <label htmlFor="ContactForm-name">
                        Име<span aria-hidden="true">*</span>
                      </label>
                      <input
                        type="text"
                        id="ContactForm-name"
                        name="contact[Име]"
                        aria-required="true"
                        required
                        defaultValue=""
                      />
                    </div>

                    <div className="grid__item medium-up--one-half">
                      <label htmlFor="ContactForm-email">
                        Имейл <span aria-hidden="true">*</span>
                      </label>
                      <input
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
                  <label htmlFor="ContactForm-message">
                    Съобщение <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    rows={10}
                    required
                    aria-required="true"
                    id="ContactForm-message"
                    name="contact[Съобщение]"
                  />

                  {/* Submit — button_style default is "primary" */}
                  <button type="submit" className="btn btn--primary">
                    <span>Прати</span>
                    <Icon name="tail-right" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import { Rte } from '@/components/snippets/Rte';
import { Icon } from '@/components/snippets/Icon';
import { newsletterSection } from '@/data/home';

type NewsletterSection = typeof newsletterSection;

// Translated from tools/output/liquid-template/sections/newsletter.liquid
// Markup confirmed against tools/output/reference/mirror/index.html (lines 12803–12861).
// The live section renders with showFormLabels=true (first + last name fields visible).
// BG strings inlined from locales/bg.json / mirror HTML ground-truth.
// No backend: form action="#", static markup only.

const FORM_ID = 'Contact_newsletter';

export function Newsletter({ section }: { section: NewsletterSection }) {
  const { title, subtitle, subheadingHtml } = section;

  return (
    <section
      id="section-newsletter"
      data-section-id="newsletter"
      className="fade-in-animation"
    >
      <div className="newsletter-section">
        <div className="page-width-small">
          <div className="section-header text-center homepage_subtitle_style_match_header">
            {subtitle && (
              <span className="h5">{subtitle}</span>
            )}
            {title && (
              <h2 className="h2">{title}</h2>
            )}
            {subheadingHtml && (
              <Rte html={subheadingHtml} />
            )}
          </div>

          <form
            method="post"
            action="#"
            id={FORM_ID}
            acceptCharset="UTF-8"
            className="contact-form form-single-field"
          >
            <input type="hidden" name="contact[tags]" value="newsletter" />

            {/* showFormLabels = true (live render confirms both name fields present) */}
            <div className="grid grid--half-gutters">
              <div className="grid__item medium-up--one-half">
                <label htmlFor={`${FORM_ID}-first-name`} className="visually-hidden" />
                <input
                  type="text"
                  name="contact[first_name]"
                  id={`${FORM_ID}-first-name`}
                  className="Form__Input  input-group__field"
                  defaultValue=""
                  placeholder="Първо име"
                  aria-label="Първо име"
                  aria-required="true"
                  autoCorrect="off"
                  autoCapitalize="off"
                  required
                />
              </div>
              <div className="grid__item medium-up--one-half">
                <label htmlFor={`${FORM_ID}-last-name`} className="visually-hidden" />
                <input
                  type="text"
                  name="contact[last_name]"
                  id={`${FORM_ID}-last-name`}
                  className="Form__Input  input-group__field"
                  defaultValue=""
                  placeholder="Фамилно име"
                  aria-label="Фамилно име"
                  aria-required="true"
                  autoCorrect="off"
                  autoCapitalize="off"
                  required
                />
              </div>
            </div>

            <div className="input-group ">
              <label htmlFor={`${FORM_ID}-email`} className="visually-hidden" />
              <input
                type="email"
                name="contact[email]"
                id={`${FORM_ID}-email`}
                className="Form__Input  input-group__field"
                defaultValue=""
                placeholder="Имейл"
                aria-label="Имейл"
                aria-required="true"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            <span className="input-group__btn-wrapper">
              <button type="submit" className="btn btn--primary" name="commit">
                <span>Подай</span>
                <Icon name="tail-right" />
              </button>
            </span>
          </form>
        </div>
      </div>
    </section>
  );
}

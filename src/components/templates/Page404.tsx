// Translation of sections/main-404.liquid.
//
// The section renders inside .page-width-small:
//   .empty-page-content.text-left.page-404-content
//     h3  — subtitle (section.settings.subtitle or fallback; rendered as custom BG text from mirror)
//     h1.mega-title--large.mega-title — title (section.settings.title from mirror)
//     .btn_wrapper
//       a.btn.btn--primary      → home link, text from mirror ("Обратно в начало")
//       a.btn--transparent_secondary → home link, text from mirror ("Свържете се с нас!")
//     .page-404-footer
//       small.site-footer__copyright-content — © year, shop name
//
// Ground truth: tools/output/reference/mirror/404-page-not-found-reference/index.html lines 1571–1593.
// Locale keys used: general.404.link ("Обратно в началото") — the mirror uses the section
// setting override "Обратно в начало"; we use the literal rendered text from the mirror.
//
// Internal links use Link from @/i18n/navigation (locale-aware).

import { Link } from '@/i18n/navigation';
import { shop } from '@/data/settings';

export function Page404() {
  const year = new Date().getFullYear();

  return (
    <div className="page-width-small">
      <div className="empty-page-content text-left page-404-content ">
        <h3> Страницата не е намерена ;( </h3>
        <h1 className="mega-title--large mega-title">Страница 404 </h1>

        <div className="btn_wrapper">
          <Link href="/" className="btn btn--primary">
            <span>Обратно в начало</span>
          </Link>

          <Link href="/" className="btn btn--transparent_secondary">
            <span>Свържете се с нас!</span>
          </Link>
        </div>

        <div className="page-404-footer">
          <small className="site-footer__copyright-content">
            &copy; {year},{' '}
            <Link href="/" title="">
              {shop.name}
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}

// Translation of sections/main-page.liquid (template config templates/page.json).
//
// The section renders:
//   1. custom_page_header — no image on generic pages → "{% else %}" branch:
//        .page-width > .section-header > h1.h2.page_header_heading + breadcrumbs
//   2. .page-width > .grid > .grid__item.medium-up--five-sixths.medium-up--push-one-twelfth
//        > .rte (page.content)
//
// Ground truth: tools/output/reference/mirror/pages/contact/index.html lines 1573–1614.

import { Breadcrumbs } from '@/components/snippets/Breadcrumbs';
import { Rte } from '@/components/snippets/Rte';

export function PageTemplate({
  title,
  contentHtml,
}: {
  title: string;
  contentHtml: string;
}) {
  // Breadcrumbs: Начало → current page (no URL for current item → aria-current="page")
  const breadcrumbItems = [
    { title: 'Начало', url: '/' },
    { title },
  ];

  return (
    <>
      {/* custom_page_header — no image branch */}
      <div className="page-width">
        <div className="section-header">
          <h1 className=" h2 page_header_heading">{title}</h1>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      {/* {% if section.settings.show_page_content %} — always true in the default config */}
      <div className="page-width">
        <div className="grid">
          <div className="grid__item medium-up--five-sixths medium-up--push-one-twelfth">
            <Rte html={contentHtml} />
          </div>
        </div>
      </div>
    </>
  );
}

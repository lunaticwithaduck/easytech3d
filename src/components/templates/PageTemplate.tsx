// Translation of sections/main-page.liquid (template config templates/page.json).
//
// The section renders:
//   1. custom_page_header — no image on generic pages → "{% else %}" branch:
//        .page-width > .section-header > h1.h2.page_header_heading + breadcrumbs
//   2. .page-width > .grid > .grid__item.medium-up--five-sixths.medium-up--push-one-twelfth
//        > .rte (page.content)
//
// Ground truth: tools/output/reference/mirror/pages/contact/index.html lines 1573–1614.

import { Container, Heading, Link, Text } from '@/design-system';
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
      <Container as="header" className="pt-8 md:pt-12">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-8 border-b border-border pb-5">
          <Heading as="h1" level={2}>
            {title}
          </Heading>
        </div>
      </Container>

      {/* {% if section.settings.show_page_content %} — always true in the default config */}
      <Container className="pb-14">
        {/* mirrors medium-up--five-sixths / push-one-twelfth: centred, max 3xl */}
        <div className="mx-auto max-w-3xl">
          <Rte html={contentHtml} />
        </div>
      </Container>
    </>
  );
}

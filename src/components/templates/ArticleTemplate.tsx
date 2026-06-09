import { Container, Heading, Image, Link, Text } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';
import { imageUrl } from '@/lib/shopify/image';
import type { ShopArticle } from '@/lib/shopify/types';

// Blog article page — design-system version (primitives only; no theme classes). A narrow,
// centered reading column: pink breadcrumbs, the hero image (rounded-media), the H1 title, the
// author/date meta, and the authored body via <Rte> (prose-styled). The verbatim theme replica
// (overlay hero, share buttons, comment form) is dropped — those surfaces are deferred and the
// theme CSS backstop is going away.

function formatDate(iso: string): string {
  // Bulgarian long format, matching the live site's locale-formatted date output.
  return new Date(iso).toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Pink breadcrumbs — same pattern as CollectionTemplate (breadcrumbs_color #ff1b5c).
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

export function ArticleTemplate({ article }: { article: ShopArticle }) {
  const { image } = article;

  // Начало → blog title → article title
  const breadcrumbs = [
    { title: 'Начало', url: '/' },
    { title: '3Д Принтове', url: `/blogs/${article.blogHandle}` },
    { title: article.title, url: article.url },
  ];

  return (
    <Container as="article" className="max-w-3xl py-10 md:py-14">
      <Breadcrumbs items={breadcrumbs} />

      {image && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-media">
          <Image
            src={imageUrl(image.src, 1500)}
            alt={image.alt || article.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <Heading as="h1" level={2} className="mb-4">
        {article.title}
      </Heading>

      <div className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border pb-6">
        <Text asChild size="sm" color="muted">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </Text>
        <Text as="span" size="sm" color="muted" value="·" />
        <Text as="span" size="sm" color="muted" value={`от ${article.author}`} />
      </div>

      <Rte html={article.contentHtml} />
    </Container>
  );
}

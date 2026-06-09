import { Button, Card, Container, Heading, Icon, Image, Link, Text } from '@/design-system';
import { imageUrl } from '@/lib/shopify/image';
import type { ShopArticle, ShopBlog } from '@/lib/shopify/types';

// Translated from tools/output/liquid-template/sections/blog-template.liquid
// Ground-truth classes confirmed against:
//   tools/output/reference/mirror/blogs/3%D0%B4-%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%BE%D0%B2%D0%B5/index.html
//
// The live blog uses layout="grid" (3 columns, medium-up--one-third) and show_excerpt=true,
// blog_show_date=true. Header: custom_page_header no-image branch → h1.h2 = Heading as="h1" level={2}.
// Card images: landscape (16:9), object-cover with aspect-video wrapper (probed: 1600×900 native).

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogTemplate({
  blog,
  articles,
}: {
  blog: ShopBlog;
  articles: ShopArticle[];
}) {
  return (
    <div className="pb-14">
      {/* custom_page_header — no-image branch: h1 styled as h2 */}
      <Container as="header" className="pt-8 md:pt-12">
        <div className="mb-8 border-b border-border pb-5">
          <Heading as="h1" level={2}>
            {blog.title}
          </Heading>
        </div>
      </Container>

      {/* Blog grid — 1 col mobile, 2 col sm, 3 col desktop (medium-up--one-third) */}
      <Container>
        <ul className="grid grid-cols-1 gap-x-[11px] gap-y-[30px] sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <li key={article.id}>
              <Card
                as="article"
                className="flex h-full flex-col overflow-hidden"
                aria-labelledby={`FeaturedBlogTitle-${i}`}
              >
                {/* Image — landscape 16:9 (probed: 1600×900), object-cover, rounded-media */}
                {article.image && (
                  <Link
                    href={article.url}
                    className="relative block aspect-video overflow-hidden rounded-[10px]"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <Image
                      src={imageUrl(article.image.src, 720)}
                      alt={article.image.alt || article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </Link>
                )}

                {/* Info — probed padding: 30px 20px (matches FeaturedBlog sibling) */}
                <div className="flex flex-1 flex-col px-5 py-[30px]">
                  {/* Title — probed: 22px 700, tracking 1px (h4 level) */}
                  <Heading
                    level={4}
                    as="h4"
                    id={`FeaturedBlogTitle-${i}`}
                    className="mb-2 font-bold tracking-[1px] leading-snug"
                  >
                    <Link
                      href={article.url}
                      className="hover:text-primary transition-colors duration-200"
                    >
                      {article.title}
                    </Link>
                  </Heading>

                  {/* blog_show_author = true → text_name branch */}
                  <Text
                    as="span"
                    size="xs"
                    color="muted"
                    className="mb-1 block"
                    value={`от ${article.author}`}
                  />

                  {/* blog_show_date = true */}
                  <Text as="p" size="2xs" color="muted" className="mb-3">
                    <time dateTime={article.publishedAt}>
                      {formatDate(article.publishedAt)}
                    </time>
                  </Text>

                  {/* show_excerpt = true */}
                  {article.excerpt && (
                    <Text
                      as="p"
                      size="sm"
                      color="muted"
                      className="mb-5 line-clamp-3"
                      value={article.excerpt}
                    />
                  )}

                  {/* Read-more button — btn btn--secondary → variant="secondary" */}
                  <div className="mt-auto">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={article.url}>
                        <Text as="span" size="xs" weight="bold" color="white" value="Прочетете още" />
                        <Icon name="tail-right" className="size-4 shrink-0" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        {articles.length === 0 && (
          <Text
            as="p"
            color="muted"
            className="py-16 text-center"
            value="Няма статии в този блог."
          />
        )}
      </Container>
    </div>
  );
}

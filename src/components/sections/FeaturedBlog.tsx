import type { featuredBlogSection } from '@/data/home';
import {
  Card,
  Container,
  Heading,
  Image,
  Link,
  Section,
  SectionHeader,
  Text,
} from '@/design-system';
import { imageUrl } from '@/lib/shopify/image';
import type { ShopArticle } from '@/lib/shopify/types';

/** Format an ISO date string as the theme does: "July 29, 2024" */
function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function FeaturedBlog({
  section,
  articles,
}: {
  section: typeof featuredBlogSection;
  articles: ShopArticle[];
}) {
  const limited = articles.slice(0, section.postLimit);

  return (
    <Section data-section-type="featured-blog">
      <Container>
        {(section.title || section.subtitle) && (
          <SectionHeader
            eyebrow={section.subtitle || undefined}
            title={section.title || undefined}
          />
        )}

        {/* enable_carousel is false — render the static grid */}
        <ul className="grid grid-cols-1 gap-x-[11px] gap-y-[30px] sm:grid-cols-2 lg:grid-cols-4">
          {limited.map((article, index) => (
            <li key={article.id}>
              <Card
                as="article"
                className="overflow-hidden"
                aria-labelledby={`FeaturedBlogTitle-${index}`}
              >
                {/* Image — square 1:1 aspect (probed live: 324×324px), rounded top, object-cover */}
                {article.image && (
                  <Link
                    href={article.url}
                    className="relative block aspect-square overflow-hidden rounded-[10px]"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <Image
                      src={imageUrl(article.image.src, 535)}
                      alt={article.image.alt || article.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </Link>
                )}

                {/* Info — probed padding: 30px 20px */}
                <div className="px-5 py-[30px]">
                  {section.showAuthor && article.author && (
                    <Text
                      as="span"
                      size="xs"
                      color="muted"
                      className="mb-2 block"
                      value={`от ${article.author}`}
                    />
                  )}

                  {/* Title — probed: 22px 700, letter-spacing 1px, margin-bottom 11px */}
                  <Heading
                    level={4}
                    as="h3"
                    id={`FeaturedBlogTitle-${index}`}
                    className="mb-[11px] font-bold tracking-[1px] leading-snug"
                  >
                    <Link
                      href={article.url}
                      className="hover:text-primary transition-colors duration-200"
                    >
                      {article.title}
                    </Link>
                  </Heading>

                  {section.showDate && (
                    <Text as="p" size="2xs" color="muted">
                      <time dateTime={article.publishedAt}>
                        {formatArticleDate(article.publishedAt)}
                      </time>
                    </Text>
                  )}

                  {article.excerpt && (
                    <Text
                      as="p"
                      size="sm"
                      color="muted"
                      className="mt-2 line-clamp-3"
                      value={article.excerpt}
                    />
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

import { Button, Card, Container, Heading, Icon, Image, Link, Text } from '@/design-system';
import { imageUrl } from '@/lib/shopify/image';
import type { ShopCollection } from '@/lib/shopify/types';

// Translation of:
//   sections/list-collections-template.liquid
//   snippets/collections-grid-item.liquid
//
// Ground truth: tools/output/reference/mirror/collections/index.html
//
// The live site renders with "display_type: all" + "sort: alphabetical" + "grid: 3" +
// "grid_mobile: 1" (from settings_data.json / rendered HTML).
//
// Probed computed styles (tools/verify/shoot.cjs https://easytech3d.com/collections):
//   .collection-grid-item        → border-radius 20px, bg white (→ <Card>)
//   .collection-grid-item__image-with-placeholder-wrapper → margin-bottom 15px
//   .collection-grid-item__info  → padding 30px 20px
//   .collection-grid-item__title → 32px / 700 / tracking 1px / color #232323 (→ Heading level={3})
//   .collection-grid-item-products-count → margin-top 10px, 16px / 400
//   .btn--secondary              → bg #3a3a3a, radius 50px, padding 13px 20px 13px 23px, mt 50px
//   .section-header h1           → 47px / 700 / tracking 2px (→ Heading as="h1" level={2})
//
// Grid: grid-cols-1 sm:grid-cols-2 md:grid-cols-3, gap-x-[11px] gap-y-5 (grid__item: pl-[11px] mb-5)

const ITEMS_PER_ROW = 3;

function Breadcrumbs({ items }: { items: { title: string; url?: string }[] }) {
  // Pink inline breadcrumbs — mirrors the pattern from CollectionTemplate.
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

function CollectionsGridItem({ collection }: { collection: ShopCollection }) {
  const image = collection.image;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {/* Image area — full-width cover image, aspect ratio ~1:1 (square) */}
      <Link href={collection.url} aria-label={collection.title} className="relative block w-full overflow-hidden" style={{ paddingTop: image ? `${(1 / image.aspectRatio) * 100}%` : '100%' }}>
        {image ? (
          <Image
            src={imageUrl(image.src, 535)}
            sizes={`(min-width: 750px) calc(100vw / ${ITEMS_PER_ROW}), 100vw`}
            alt={image.alt || collection.title}
            fill
            className="object-cover"
          />
        ) : (
          /* Placeholder when no image */
          <div className="absolute inset-0 bg-[#f4f4f4]" />
        )}
      </Link>

      {/* Info — padding 30px 20px (probed) */}
      <div className="flex flex-1 flex-col px-5 pb-[30px] pt-[30px]">
        {/* Title — 32px / 700 / tracking-[1px] (probed .collection-grid-item__title → h3 level) */}
        <Heading as="h2" level={3} className="text-ink">
          <Link href={collection.title ? collection.url : '#'} className="hover:text-primary">
            {collection.title || 'Примерна колекция'}
          </Link>
        </Heading>

        {/* Product count — mt-[10px] / 16px / muted (probed) */}
        <Text as="p" size="base" color="muted" className="mt-[10px]">
          {collection.productsCount} продукти
        </Text>

        {/* "Разгледай →" button — secondary (bg #3a3a3a), mt-[50px] (probed) */}
        <div className="mt-[50px]">
          <Button variant="secondary" asChild>
            <Link href={collection.url}>
              <Text as="span" weight="bold" color="white" value="Разгледай" />
              <Icon name="tail-right" className="size-4 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ListCollectionsTemplate({
  collections,
}: {
  collections: ShopCollection[];
}) {
  return (
    <div className="pb-14">
      {/* Page header — mirrors: <div class="page-width"><div class="section-header"><h1 class="h2"> */}
      <Container as="header" className="pt-8 md:pt-12">
        <Breadcrumbs
          items={[
            { title: 'Начало', url: '/' },
            { title: 'Колекции', url: '/collections' },
          ]}
        />
        <Heading as="h1" level={2} className="mb-6 border-b border-border pb-5">
          Колекции
        </Heading>
      </Container>

      {/* Collections grid — grid-cols-1 sm:grid-cols-2 md:grid-cols-3, 11px col gap, 20px row gap */}
      <Container>
        <div className="grid grid-cols-1 gap-x-[11px] gap-y-5 sm:grid-cols-2 md:grid-cols-3">
          {collections.map((collection) => (
            <CollectionsGridItem key={collection.id} collection={collection} />
          ))}
        </div>
      </Container>
    </div>
  );
}

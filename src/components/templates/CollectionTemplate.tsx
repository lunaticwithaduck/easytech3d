import { Button, Container, Heading, Icon, Image, Link, Text, cn } from '@/design-system';
import { Rte } from '@/components/snippets/Rte';
import { ProductCard } from '@/components/product/ProductCard';
import { imageUrl } from '@/lib/shopify/image';
import type { ShopCollection, ShopProduct } from '@/lib/shopify/types';

// Collection page — design-system version (primitives only). Plain text header is the default
// (matches the live store); a small allowlist of collections renders the dark image banner instead.
// Grid: 3-up desktop / 1-up mobile (grid 3 / grid_mobile 1), 11px gutter, 30px row gap.
const BANNER_COLLECTION_HANDLES = new Set(['nozzles']);

function Breadcrumbs({ items }: { items: { title: string; url?: string }[] }) {
  // breadcrumbs_color #ff1b5c → pink crumbs (see the computed :root).
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

function FiltersToolbar({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3">
      <Text as="span" size="sm" color="muted" value={`${count} продукта`} />
      <div className="ml-2 flex items-center gap-1">
        <button type="button" aria-label="Мрежа" className="text-ink/70 hover:text-ink">
          <Icon name="grid" className="size-5" />
        </button>
        <button type="button" aria-label="Лист" className="text-ink/40 hover:text-ink">
          <Icon name="list" className="size-5" />
        </button>
      </div>
    </div>
  );
}

export function CollectionTemplate({
  collection,
  products,
}: {
  collection: ShopCollection;
  products: ShopProduct[];
}) {
  const { image } = collection;
  const showBanner = image != null && BANNER_COLLECTION_HANDLES.has(collection.handle);
  const breadcrumbItems = [
    { title: 'Начало', url: '/' },
    { title: collection.title, url: collection.url },
  ];

  return (
    <div className="pb-14">
      {showBanner && image ? (
        <header className="relative mb-8 flex h-[280px] items-center overflow-hidden md:h-[360px]">
          <Image src={imageUrl(image.src, 1500)} alt={image.alt || collection.title} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <Container className="relative">
            <Heading as="h1" level={1} color="white">
              {collection.title}
            </Heading>
          </Container>
        </header>
      ) : (
        <Container as="header" className="pt-8 md:pt-12">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="mb-8 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
            <Heading as="h1" level={2}>
              {collection.title}
            </Heading>
            <FiltersToolbar count={collection.productsCount} />
          </div>
        </Container>
      )}

      <Container>
        <div
          className={cn(
            'grid grid-cols-1 gap-x-[11px] gap-y-[30px] md:grid-cols-3',
            showBanner && 'mt-6',
          )}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <Text as="p" color="muted" className="py-16 text-center" value="Няма продукти в тази колекция." />
        )}

        {collection.descriptionHtml && (
          <Rte html={collection.descriptionHtml} className="mt-12 max-w-3xl text-ink/80" />
        )}
      </Container>
    </div>
  );
}

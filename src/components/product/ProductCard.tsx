import { Button, Card, Icon, Image, Link, Price, ProductLabel, Text, cn } from '@/design-system';
import { imageUrl } from '@/lib/shopify/image';
import { percentSavings } from '@/lib/shopify/money';
import type { ShopProduct } from '@/lib/shopify/types';

// Product card — design-system version (primitives only; no theme classes). Faithful to the live
// card: white surface radius 20 / padding 20, ~200px contained image with an alternate hover image,
// outlined green sale label, dual лв/€ price, 22px regular title, and the two pink pill buttons
// (Добави в количката + Бърз преглед). Fills its grid cell (h-full); the parent provides the cell.
export function ProductCard({ product, showVendor = false }: { product: ShopProduct; showVendor?: boolean }) {
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const soldOut = !product.available;
  const alternate = product.media[1];

  return (
    <Card className="group relative flex h-full flex-col p-5">
      {(onSale || soldOut) && (
        <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-2">
          {onSale && product.compareAtPrice != null && (
            <ProductLabel tone="sale">
              На промоция от: {percentSavings(product.price, product.compareAtPrice)} !
            </ProductLabel>
          )}
          {soldOut && <ProductLabel tone="soldout">Изкупено</ProductLabel>}
        </div>
      )}

      <Link href={product.url} aria-label={product.title} className="relative mb-4 block h-[200px] w-full">
        <Image
          src={imageUrl(product.featuredImage.src, 535)}
          alt={product.featuredImage.alt || product.title}
          fill
          sizes="(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw"
          className="object-contain"
        />
        {alternate && (
          <Image
            src={imageUrl(alternate.src, 535)}
            alt=""
            fill
            sizes="(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw"
            className={cn(
              'object-contain opacity-0 transition-opacity duration-300',
              'group-hover:opacity-100',
            )}
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        {showVendor && product.vendor ? (
          <Text as="span" size="xs" color="muted" className="mb-1" value={product.vendor} />
        ) : null}

        <Link href={product.url} aria-label={product.title} className="mb-2 block">
          <Text as="span" size="h4" weight="normal" className="line-clamp-2 hover:text-primary" value={product.title} />
        </Link>

        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="mb-4" />

        <div className="mt-auto flex flex-col gap-2">
          <Button variant="primary" block aria-label="Добави в количката">
            <Text as="span" weight="bold" color="white" value="Добави в количката" />
            <Icon name="cart" className="size-5 shrink-0" />
          </Button>
          <Button variant="primary" block aria-label="Бърз преглед">
            <Text as="span" weight="bold" color="white" value="Бърз преглед" />
            <Icon name="tail-right" className="size-4 shrink-0" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

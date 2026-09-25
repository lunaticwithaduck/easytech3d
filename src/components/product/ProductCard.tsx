import { Card, cn, Image, Link, Price, ProductLabel, Text } from '@/design-system';
import { imageUrl } from '@/lib/shopify/image';
import { percentSavings } from '@/lib/shopify/money';
import type { ShopProduct } from '@/lib/shopify/types';
import { AddToCartButton } from './AddToCartButton';
import { QuickView } from './QuickView';

// Product card — design-system version (primitives only; no theme classes). Faithful to the live
// card: white surface radius 20 / padding 20, ~200px contained image with an alternate hover image,
// outlined green sale label, EUR price, 22px regular title, and the two pink pill buttons
// (Добави в количката + Бърз преглед). Fills its grid cell (h-full); the parent provides the cell.
//
// Two layouts (export/props otherwise identical):
//   • default (grid)  → vertical card; image on top, info stacked below (collection / featured).
//   • list (`list`)   → horizontal row used on the search results page. Probed from live
//     /search?q=pla (.product-card list view): flex-row, padding 20, a fixed ~269px object-contain
//     image box on the LEFT, and a flex-1 info column on the RIGHT (vendor 13px, 22px title,
//     price, then the two stacked pill buttons ~400px wide) with a 50px gap to the image.
export function ProductCard({
  product,
  showVendor = false,
  list = false,
}: {
  product: ShopProduct;
  showVendor?: boolean;
  list?: boolean;
}) {
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const soldOut = !product.available;
  const alternate = product.media[1];
  const defaultVariant = product.variants.find((v) => v.available) ?? product.variants[0];

  const labels = (onSale || soldOut) && (
    <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-2">
      {onSale && product.compareAtPrice != null && (
        <ProductLabel tone="sale">
          На промоция от: {percentSavings(product.price, product.compareAtPrice)} !
        </ProductLabel>
      )}
      {soldOut && <ProductLabel tone="soldout">Изкупено</ProductLabel>}
    </div>
  );

  const media = (
    <Link
      href={product.url}
      aria-label={product.title}
      className={cn('relative block w-full', list ? 'h-[200px]' : 'mb-4 h-[215px]')}
    >
      <Image
        src={imageUrl(product.featuredImage.src, 535)}
        alt={product.featuredImage.alt || product.title}
        fill
        sizes={list ? '269px' : '(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw'}
        // When there's a hover image, fade the primary OUT as the alternate fades IN (clean
        // cross-fade — otherwise both stack and the alternate shows over the primary).
        className={cn(
          'object-contain',
          alternate && 'transition-opacity duration-300 group-hover:opacity-0',
        )}
      />
      {alternate && (
        <Image
          src={imageUrl(alternate.src, 535)}
          alt=""
          fill
          sizes={list ? '269px' : '(min-width: 990px) 25vw, (min-width: 750px) 33vw, 50vw'}
          className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
    </Link>
  );

  const info = (
    <div className={cn('flex min-w-0 flex-1 flex-col', list && 'sm:pl-[50px]')}>
      {showVendor && product.vendor ? (
        <Text as="span" size="xs" color="muted" className="mb-1" value={product.vendor} />
      ) : null}

      <Link href={product.url} aria-label={product.title} className="mb-2 block">
        <Text
          as="span"
          size="h4"
          weight="normal"
          className="line-clamp-2 leading-none hover:text-primary"
          value={product.title}
        />
      </Link>

      <Price price={product.price} compareAtPrice={product.compareAtPrice} className="mb-4" />

      {/* Live card CTAs are the standard .btn: 16px / 50px tall / padding 13px 20px 13px 23px. */}
      <div className={cn('mt-auto flex flex-col gap-3', list && 'sm:max-w-[400px]')}>
        <AddToCartButton variantId={defaultVariant?.id ?? null} available={!soldOut} />
        <QuickView product={product} />
      </div>
    </div>
  );

  if (list) {
    return (
      <Card className="group relative flex flex-col gap-5 p-5 sm:flex-row">
        {labels}
        <div className="relative w-full shrink-0 sm:w-[269px]">{media}</div>
        {info}
      </Card>
    );
  }

  return (
    <Card className="group relative flex h-full flex-col p-5">
      {labels}
      {media}
      {info}
    </Card>
  );
}

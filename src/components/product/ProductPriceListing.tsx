// Translation of snippets/product-price-listing.liquid
// Accompanies product listings (collection page, search result).
// Markup and class names are preserved verbatim from the Liquid source.

import type { ReactElement } from 'react';
import { cn } from '@/lib/cn';
import { money } from '@/lib/shopify/money';
import type { ShopProduct, ShopVariant } from '@/lib/shopify/types';

export function ProductPriceListing({
  product,
}: {
  product: ShopProduct;
  /** Accepted for caller symmetry; the listing snippet reads product-level fields only. */
  variant?: ShopVariant;
}): ReactElement {
  // ── price resolution (mirrors the Liquid's {%- liquid ... -%} block) ────────
  // product-price-listing.liquid always reads from product, ignoring the passed variant;
  // the passed variant is kept in the contract so callers can supply it, but the listing
  // snippet only consumes product-level fields.
  const compareAtPrice = product.compareAtPrice;
  const price = product.price;
  const available = product.available;

  // price_varies: product has a price range (priceMin != priceMax)
  const priceVaries = product.priceMin !== product.priceMax;

  // money_compare: compare-at price as "X.XX €"
  const moneyCompare = compareAtPrice !== null ? money(compareAtPrice) : '';

  // ── modifier classes ─────────────────────────────────────────────────────────
  const wrapperClass = cn(
    'price price--listing',
    !available && 'price--sold-out',
    compareAtPrice !== null && compareAtPrice > price && 'price--on-sale',
  );

  // ── price string used in both __regular and __sale ───────────────────────────
  const priceSpan = <span>{money(price)}</span>;

  // from_lowest_price_html: "от {{ lowest_price }}" — used when price varies
  const fromLowestPrice = `от ${money(product.priceMin)}`;

  return (
    <div className={wrapperClass}>
      {/* ── .price__regular ─────────────────────────────────────────────────── */}
      <div className="price__regular">
        <span className="visually-hidden visually-hidden--inline">Нормална цена</span>
        <span className="price-item price-item--regular">
          {priceVaries ? fromLowestPrice : priceSpan}
        </span>
      </div>

      {/* ── .price__sale ────────────────────────────────────────────────────── */}
      <div className="price__sale">
        <span className="visually-hidden visually-hidden--inline">Цена</span>
        <span className="price-item price-item--sale">
          {priceVaries ? fromLowestPrice : priceSpan}
        </span>

        <div className="price__compare">
          <span className="visually-hidden visually-hidden--inline">Нормална цена</span>
          <s className="price-item price-item--regular">{moneyCompare}</s>
        </div>
      </div>

      {/* ── .price__unit ─────────────────────────────────────────────────────
          The unit-price block is always rendered (CSS hides it via price--unit-available).
          Our ShopVariant type has no unitPriceMeasurement, so the inner values are empty. */}
      <div className="price__unit">
        <span className="visually-hidden visually-hidden--inline">Unit price</span>
        <div className="price-unit-price">
          <span></span>
          <span aria-hidden="true">/</span>
          <span className="visually-hidden">за&nbsp;</span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

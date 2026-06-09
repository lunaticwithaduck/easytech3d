// Translation of snippets/product-price-listing.liquid
// Accompanies product listings (collection page, search result).
// Markup and class names are preserved verbatim from the Liquid source.

import type { ReactElement } from 'react';
import { cn } from '@/lib/cn';
import { money, moneyWithoutCurrency, EUR_RATE } from '@/lib/shopify/money';
import type { ShopProduct, ShopVariant } from '@/lib/shopify/types';

export function ProductPriceListing({
  product,
  variant,
}: {
  product: ShopProduct;
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

  // EUR conversion: {{ price_full | times: 0.51 }}
  const convertedPrice = Math.round(price * EUR_RATE);

  // money_compare: compare-at price as "X.XX лв"
  const moneyCompare = compareAtPrice !== null ? money(compareAtPrice) : '';

  // ── modifier classes ─────────────────────────────────────────────────────────
  const wrapperClass = cn(
    'price price--listing',
    !available && 'price--sold-out',
    compareAtPrice !== null && compareAtPrice > price && 'price--on-sale',
  );

  // ── dual price string used in both __regular and __sale ─────────────────────
  // {{ price_full | money_without_currency }} лв / {{ converted_price | money_without_currency }} €
  const dualPriceSpan = (
    <span>
      {moneyWithoutCurrency(price)} лв / {moneyWithoutCurrency(convertedPrice)} €
    </span>
  );

  // from_lowest_price_html: "от {{ lowest_price }}" — used when price varies
  const fromLowestPrice = `от ${money(product.priceMin)}`;

  return (
    <div className={wrapperClass}>
      {/* ── .price__regular ─────────────────────────────────────────────────── */}
      <div className="price__regular">
        <span className="visually-hidden visually-hidden--inline">Нормална цена</span>
        <span className="price-item price-item--regular">
          {priceVaries ? fromLowestPrice : dualPriceSpan}
        </span>
      </div>

      {/* ── .price__sale ────────────────────────────────────────────────────── */}
      <div className="price__sale">
        <span className="visually-hidden visually-hidden--inline">Цена</span>
        <span className="price-item price-item--sale">
          {priceVaries ? fromLowestPrice : dualPriceSpan}
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

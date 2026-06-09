// Translated from snippets/product-card-item.liquid (Shopify Dawn-family theme).
// Faithful markup + verbatim class names so the theme's own CSS styles it. The add-to-cart has no
// backend, so the action form is rendered as a static `type="button"` theme button (no submit).
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/snippets/Icon';
import { ProductPriceListing } from '@/components/product/ProductPriceListing';
import { imageUrl, imageSrcset } from '@/lib/shopify/image';
import { percentSavings } from '@/lib/shopify/money';
import type { ShopProduct } from '@/lib/shopify/types';

// Liquid `color_label` list — option names that count as a colour option (we keep the BG "Цвят").
const COLOR_OPTION_NAMES = [
  'color',
  'colour',
  'couleur',
  'colore',
  'farbe',
  '색',
  '色',
  'カラー',
  'färg',
  'farve',
  'цвят',
];

export function ProductCardItem({
  product,
  maxHeight = 250,
  showVendor = false,
  list = false,
}: {
  product: ShopProduct;
  maxHeight?: number;
  showVendor?: boolean;
  list?: boolean;
}) {
  const previewImage = product.featuredImage;
  const soldOut = !product.available;

  // settings.show_second_image_on_hover && product.media[1] != blank  →  alternate hover image.
  // theme.css fades it in on `.product-item-block--withAlternateImage` cards.
  const alternateImage = product.media[1] ?? null;
  const hasAlternateImage = alternateImage != null;

  // settings.show_discount && product.price < product.compare_at_price  →  sale label (percentage).
  const onSale =
    product.compareAtPrice != null && product.price < product.compareAtPrice;
  const savings = onSale
    ? percentSavings(product.price, product.compareAtPrice as number)
    : '';

  // settings.align_height aspect-ratio padding wrapper (the live theme has it enabled).
  const aspectPadding = previewImage?.aspectRatio
    ? `${(1 / previewImage.aspectRatio) * 100}%`
    : '100%';

  // Colour swatches (simplified): the option named "Цвят"/"Color" and its values.
  const colorOption = product.options.find((o) =>
    COLOR_OPTION_NAMES.includes(o.name.toLowerCase().trim()),
  );
  const swatchLimit = 5;
  const swatchValues =
    colorOption && colorOption.values.length > 1
      ? colorOption.values.slice(0, swatchLimit + 1)
      : [];
  const colorName = `swatch-${product.id}`;

  return (
    <div
      className={cn(
        'zoom-fade-animation-element-wrapper grid__item product-item-block',
        list ? 'view-mode-list' : 'view-mode-grid',
        'medium-up--one-third small--one-whole',
        hasAlternateImage && 'product-item-block--withAlternateImage',
      )}
    >
      <div
        className={cn('product-card product-card-wrapper', soldOut && 'item--sold-out')}
      >
        {(onSale || (soldOut)) && (
          <div className="product-item__label-list">
            {onSale && (
              <span className="product-label product-label--on-sale">{`На промоция от: ${savings} !`}</span>
            )}
            {soldOut && (
              <span className="product-label product-label--soldout">Изкупено</span>
            )}
          </div>
        )}

        <div className="product-item--media">
          <div className="product-card__image-with-placeholder-wrapper">
            <Link
              className="list-view-item__link-image product-card__link-image"
              href={product.url}
            >
              <div className="list-view-item__image-wrapper product-card__image-wrapper js">
                <div style={{ paddingTop: aspectPadding }}>
                  {previewImage && (
                    <img
                      className="list-view-item__image product-card__image zoom-fade-animation-element"
                      alt={previewImage.alt || product.title}
                      srcSet={imageSrcset(previewImage.src, previewImage.width)}
                      src={imageUrl(previewImage.src, 535)}
                      sizes="100vw"
                      loading="lazy"
                      width={previewImage.width}
                      height={previewImage.height}
                      data-image=""
                    />
                  )}
                  {hasAlternateImage && (
                    <img
                      className="item__image product-card__image product-card__image--alternate"
                      alt={alternateImage.alt || product.title}
                      srcSet={imageSrcset(alternateImage.src, alternateImage.width)}
                      src={imageUrl(alternateImage.src, 535)}
                      sizes="100vw"
                      loading="lazy"
                      width={alternateImage.width}
                      height={alternateImage.height}
                      data-image=""
                    />
                  )}
                </div>
              </div>
            </Link>
          </div>

          {swatchValues.length > 1 && (
            <div className="product-item__swatches">
              <div className="color-swatch-list">
                {swatchValues.map((value, index) => {
                  const downcased = value.toLowerCase().trim();
                  const isWhite = downcased === 'white' || downcased === 'blanc';
                  const overLimit = index + 1 > swatchLimit;
                  const swatchId = `${colorName}-${index + 1}`;
                  return (
                    <div
                      key={swatchId}
                      className={cn(
                        'color-swatch',
                        overLimit && 'color-swatch--view-more',
                        isWhite && 'color-swatch--white',
                      )}
                    >
                      <input
                        className="color-swatch__radio"
                        type="radio"
                        name={colorName}
                        id={swatchId}
                        value={value}
                        aria-labelledby={swatchId}
                        defaultChecked={index === 0}
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                      <label
                        className="color-swatch__item"
                        htmlFor={swatchId}
                        title={value}
                      ></label>
                      <Link href={product.url} className="color-swatch__item-link">
                        +{colorOption!.values.length - index}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="product-item--info">
          {showVendor && product.vendor && (
            <div>
              <a className="product-item__vendor link" href="#">
                {product.vendor}
              </a>
            </div>
          )}

          <Link
            className="item__link-title product-card__link-title"
            href={product.url}
            aria-label={product.title}
          >
            <span className="h4 item__title product-card__title" aria-hidden="true">
              {product.title}
            </span>
          </Link>

          <div className="product-item__price_and_reviews_row">
            <ProductPriceListing product={product} />

            <a
              className="product-item__reviews-badge link"
              href={`${product.url}#product-reviews`}
              aria-hidden="true"
              tabIndex={-1}
            >
              <span className="shopify-product-reviews-badge" data-id={product.id}>
                <div className="spr-badge" style={{ opacity: 0 }}>
                  <span className="spr-starrating spr-badge-starrating">
                    <i className="spr-icon spr-icon-star-empty"></i>
                    <i className="spr-icon spr-icon-star-empty"></i>
                    <i className="spr-icon spr-icon-star-empty"></i>
                    <i className="spr-icon spr-icon-star-empty"></i>
                    <i className="spr-icon spr-icon-star-empty"></i>
                  </span>
                </div>
              </span>
            </a>
          </div>

          <form className="product-item__action-list product-item__action-list--list-view-only button-stack with_quickview_btn">
            <button type="button" className="btn product-form__cart-submit btn--primary">
              <span data-add-to-cart-text>Добави в количката</span>
              <Icon name="cart" />
            </button>
          </form>

          <button
            type="button"
            className="btn btn--primary open-quick-view--btn"
            aria-controls="modal-quick-view"
            data-product-url={product.url}
          >
            <span>Бърз преглед</span>
            <Icon name="tail-right" />
          </button>
        </div>
      </div>
    </div>
  );
}

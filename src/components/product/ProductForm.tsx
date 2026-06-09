'use client';

// Translation of the buy-box (`product-single__meta` form) from
// sections/product-template.liquid — block order per templates/product.json:
//   sku_block · product_title · rating · product_vendor · product_price ·
//   product_options_block (+ swatches) · quantity_block · product_buttons ·
//   back_in_stock · product_description (full-width, rendered by the template).
//
// Interactive bits (variant <select>, colour swatches, quantity stepper) live here as a client
// component; everything is markup + verbatim theme class names (no backend — the add-to-cart and
// buy-now buttons are type="button"). Class lists verified against the rendered ground truth:
//   tools/output/reference/mirror/products/elegoo-pla-red-filament/index.html (lines 1864-2084)

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/snippets/Icon';
import { ProductPriceListing } from '@/components/product/ProductPriceListing';
import type { ShopProduct, ShopVariant } from '@/lib/shopify/types';

// Liquid swatch.liquid treats an option as a colour swatch when its (downcased) name contains
// 'color'/'colour'; the store also lists custom names (settings.swatch_option_name) — we keep the
// BG "Цвят".
const COLOR_OPTION_NAMES = ['color', 'colour', 'цвят'];

// `handle` filter (used for swatch_{{ value | handle }} class + radio ids).
function handleize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductForm({ product }: { product: ShopProduct }) {
  const hasOnlyDefaultVariant =
    product.variants.length <= 1 &&
    product.options.length === 1 &&
    product.options[0]?.values.length === 1;

  const currentVariant: ShopVariant | undefined =
    product.variants.find((v) => v.available) ?? product.variants[0];

  // selected option values (option name -> value), seeded from the current variant.
  const [selected, setSelected] = useState<string[]>(
    () => currentVariant?.options ?? product.options.map((o) => o.values[0]),
  );

  const [quantity, setQuantity] = useState(1);

  const setOption = (index: number, value: string) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const sku = currentVariant?.sku;
  const available = currentVariant?.available ?? product.available;

  return (
    <div className="product-single__meta">
      <form
        method="post"
        action="/cart/add"
        acceptCharset="UTF-8"
        className="product-form product-form-main"
        encType="multipart/form-data"
        noValidate
        data-product-form=""
      >
        <input type="hidden" name="form_type" value="product" />
        <input type="hidden" name="utf8" value="✓" />

        {/* ── sku_block ─────────────────────────────────────────────────────── */}
        <p className="product_sku" style={sku ? undefined : { display: 'none' }}>
          SKU: <span className="variant-sku"> {sku}</span>
        </p>

        {/* ── product_title ─────────────────────────────────────────────────── */}
        <h1 className=" product-single__title h3">{product.title}</h1>

        {/* ── product_vendor ────────────────────────────────────────────────── */}
        <div className="price__vendor">
          <span className="visually-hidden">Доставчик</span>{' '}
          <a href={`/collections/vendors?q=${product.vendor}`} title={product.vendor}>
            {product.vendor}
          </a>
        </div>

        {/* ── product_price ─────────────────────────────────────────────────── */}
        <div className="product__price">
          <ProductPriceListing product={product} variant={currentVariant} />
        </div>
        <div className="product__policies rte" data-product-policies="">
          ДДС Включено.
        </div>
        <div className="shopify-payment-terms"></div>

        {/* ── product_options_block ─────────────────────────────────────────── */}
        {!hasOnlyDefaultVariant && (
          <div className="product-form__controls-group product_options_block_wrapper">
            {product.options.map((option, optIndex) => (
              <div key={option.name} className="selector-wrapper js product-form__item">
                <label className="header" htmlFor={`SingleOptionSelector-main-${optIndex}`}>
                  {option.name}
                </label>
                <select
                  className={cn(
                    'single-option-selector single-option-selector-main product-form__input',
                    `single_option_${option.name.toLowerCase()}_selector-main`,
                  )}
                  id={`SingleOptionSelector-main-${optIndex}`}
                  data-option-name={option.name.toLowerCase()}
                  data-index={`option${optIndex + 1}`}
                  value={selected[optIndex] ?? option.values[0]}
                  onChange={(e) => setOption(optIndex, e.target.value)}
                >
                  {option.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* ── product swatches (swatch.liquid, colour options only) ──────────── */}
        {!hasOnlyDefaultVariant && (
          <div className="product_swatches">
            {product.options.map((option, optIndex) => {
              const isColor = COLOR_OPTION_NAMES.includes(option.name.toLowerCase().trim());
              if (!isColor) return null;
              return (
                <div key={option.name} className=" clearfix form_bg_row">
                  <div className="swatch" data-option-index={optIndex}>
                    <div className="header">{option.name}: </div>
                    <div className="swatch_elements_wrapper">
                      {option.values.map((value) => {
                        const isSelected = selected[optIndex] === value;
                        const radioId = `swatch-main-${product.id}-${optIndex}-${handleize(value)}`;
                        return (
                          <div
                            key={value}
                            data-value={value}
                            className={cn(
                              'swatch-element color',
                              `swatch_${handleize(value)}`,
                              available ? 'available' : 'soldout',
                            )}
                          >
                            <input
                              id={radioId}
                              type="radio"
                              name={`option-${optIndex}`}
                              value={value}
                              checked={isSelected}
                              onChange={() => setOption(optIndex, value)}
                            />
                            <label htmlFor={radioId} title={value}>
                              <img
                                className="crossed-out"
                                src="/soldout.png"
                                alt="Изпродадено"
                              />
                              <span className="swatch_check_icon">
                                <Icon name="check" />
                              </span>
                            </label>
                            <div className="tooltip">{value}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* no-js variant <select> (mirrors the theme's .product-form__variants.no-js) */}
        <select name="id" id="ProductSelect-main" className="product-form__variants no-js" defaultValue={currentVariant?.id}>
          {product.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.title}
              {variant.available === false ? ' - Изпродадено' : ''}
            </option>
          ))}
        </select>

        {/* ── quantity_block ────────────────────────────────────────────────── */}
        <div className="form_bg_row quantity_block">
          <div className="product_quantity_info_container">
            <div className="qty_container">
              <label className="header" htmlFor="Quantity-main">
                Количество:
              </label>
              <div className="qty product-page-qty">
                <a
                  href="javascript:void(0);"
                  className="minus_btn qty_btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                ></a>
                <input
                  type="text"
                  id="Quantity-main"
                  name="quantity"
                  value={quantity}
                  min="1"
                  pattern="[0-9]*"
                  className="product-form__input product-form__input--quantity"
                  data-quantity-input=""
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setQuantity(Number.isNaN(n) ? 1 : Math.max(1, n));
                  }}
                />
                <a
                  href="javascript:void(0);"
                  className="plus_btn qty_btn"
                  onClick={() => setQuantity((q) => q + 1)}
                ></a>
              </div>
            </div>
          </div>
        </div>

        {/* ── product_buttons ───────────────────────────────────────────────── */}
        <div className="product-form__controls-group  product-form-sticky-parent  product-form__controls-group--submit ">
          <div className="product-form__item product-form__item--submit product-form__item--payment-button">
            <button
              type="button"
              name="add"
              aria-label="Добави в количката"
              className="btn product-form__cart-submit btn--primary"
              data-add-to-cart=""
            >
              <span data-add-to-cart-text="">
                {available ? 'Добави в количката' : 'Изпродадено'}
              </span>
              <Icon name="cart" />
              <span className="hide" data-loader="">
                {/* icon-spinner.liquid — verbatim from the mirror */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  role="presentation"
                  className="icon icon-spinner"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z"
                    fill="#919EAB"
                  />
                </svg>
              </span>
            </button>

            {/* Dynamic "Buy it now" accelerated checkout (no backend — static button markup). */}
            <div className="shopify-payment-button">
              <button
                type="button"
                className="shopify-payment-button__button shopify-payment-button__button--unbranded"
              >
                Купете сега
              </button>
            </div>
          </div>

          <div className="pre_order_text  hide ">
            Това е артикул за предварителна поръчка. Ще го получите когато го презаредим.
          </div>
        </div>

        <div
          className="product-form__error-message-wrapper product-form__error-message-wrapper--hidden"
          data-error-message-wrapper=""
          role="alert"
        >
          <span className="visually-hidden">Грешка !!! </span>
          {/* icon-error.liquid — verbatim from the mirror */}
          <svg
            aria-hidden="true"
            focusable="false"
            role="presentation"
            className="icon icon-error"
            viewBox="0 0 14 14"
          >
            <g fill="none" fillRule="evenodd">
              <path d="M7 0a7 7 0 0 1 7 7 7 7 0 1 1-7-7z" />
              <path
                className="icon-error__symbol"
                d="M6.328 8.396l-.252-5.4h1.836l-.24 5.4H6.328zM6.04 10.16c0-.528.432-.972.96-.972s.972.444.972.972c0 .516-.444.96-.972.96a.97.97 0 0 1-.96-.96z"
              />
            </g>
          </svg>
          <span className="product-form__error-message" data-error-message="">
            Quantity must be 1 or more
          </span>
        </div>

        <p
          className="visually-hidden"
          data-loader-status=""
          aria-live="assertive"
          role="alert"
          aria-hidden="true"
        >
          Добавяне на артикул към количката...
        </p>

        {/* ── back_in_stock ─────────────────────────────────────────────────── */}
        <div
          className={cn('back_in_stock_row', available && 'hide')}
          data-id={`ContactForm_${product.id}`}
        >
          <div className="back_in_stock_response"></div>
          <label htmlFor={`back_in_stock_custom_formInput-${product.id}`}>
            <span className="h5">Извести ме като се презареди</span>
          </label>
          <div className="back_in_stock_custom_form">
            <input
              type="email"
              id={`back_in_stock_custom_formInput-${product.id}`}
              className="Form__Input  input-group__field"
              defaultValue=""
              placeholder="Имейл"
              autoCorrect="off"
              autoCapitalize="off"
            />
            <span className="input-group__btn-wrapper">
              <button type="button" className="btn btn--primary back_in_stock_btn">
                <Icon name="check" />
              </button>
            </span>
          </div>
        </div>

        <input type="hidden" name="product-id" value={product.id} />
        <input type="hidden" name="section-id" value="main" />
      </form>
    </div>
  );
}

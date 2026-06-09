// Translation of sections/search-page.liquid
//
// Config / Liquid context mapped to static choices:
//   filters_view_mode = "sidebar_fixed_left"  (section.settings.search_layout default)
//   pagination_mode   = "standart"             (no AjaxinateContainer)
//   header_image      = blank                  (no custom_page_header; heading rendered inline)
//   settings.align_height = true               → use_align_height (matches mirror line 1773)
//   max_height        = 345                    (search.results_size > 0 branch)
//
// Ground truth: tools/output/reference/mirror/search/index.html (lines 1588–1770+)
// BG strings: tools/output/liquid-template/locales/en.default.json (general.search.*)
//   + bg-BG.json / bg.json for the override strings present there.
//
// NOTE: The search form is interactive (controlled input for the `q` param), so this
// component is a Client Component. The parent page.tsx is a Server Component that fetches
// data and passes it down.

'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { ProductCardItem } from '@/components/product/ProductCardItem';
import type { ShopProduct } from '@/lib/shopify/types';

// BG strings inlined from locales ({{ '...' | t }}).
// general.search.title         → "Потърсете в нашия сайт"
// general.search.heading       → "Резултати на търсенето" (plural)
// general.search.results_with_count.other → "{{ count }} резултати за "{{ terms }}""
// general.search.results_with_count.one   → "{{ count }} резултат за "{{ terms }}""
// general.search.placeholder   → "Търсене"
// general.search.submit        → "Потърси"
// general.search.no_results    → "Няма резултати. Пробвайте да промените ключовите думи"
// general.search.sidebar.mobile_open_button → "Филтър"

const MAX_HEIGHT = 345;

// Replicate Liquid: {{ 'general.search.results_with_count' | t: terms: searchTerms, count: n }}
function resultsWithCount(terms: string, count: number): string {
  if (count === 1) {
    return `${count} резултат за “${terms}”`;
  }
  return `${count} резултати за “${terms}”`;
}

export function SearchTemplate({
  query,
  results,
}: {
  query: string;
  results: ShopProduct[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // {% assign searchTerms = search.terms | split: "AND" | first | remove: "*" %}
  // In our data layer `query` is already the clean term.
  const searchTerms = query;

  // {% if search.performed == false %}
  const performed = searchTerms.trim().length > 0;
  const resultsCount = results.length;

  // {% if search.performed and search.results_count == 0 %}
  const noResults = performed && resultsCount === 0;

  // heading: rendered when performed (as in the liquid: {% else %} branch)
  const headerHeading = performed
    ? resultsWithCount(searchTerms, resultsCount)
    : 'Потърсете в нашия сайт';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? '';
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    // data-section-type and data-pagination_mode mirror the live rendered HTML (line 1588).
    <div
      data-section-id="template--main"
      data-section-type="search-template"
      data-pagination_mode="standart"
    >
      {/* {% paginate search.results by 10 %} — we receive all results from the server */}

      <div className="page-width">
        {/*
          {% assign filters_view_mode = 'sidebar_fixed_left' %}
          {% assign results_count == 0 %} → adds EmptySearch_Section class
          Mirror line 1595: class="Search_Section filters_view_mode_sidebar_fixed_left"
        */}
        <div
          className={`Search_Section filters_view_mode_sidebar_fixed_left${noResults ? ' EmptySearch_Section' : ''}`}
        >
          {/*
            {% if filters_view_mode != 'no_sidebar' and search.results.size > 0 %}
            {% include 'search-sidebar' %}
            Static facet rail matching the live sidebar (search-sidebar.liquid).
            Availability + Price blocks mirror tools/output/reference/mirror/search/index.html
            lines 1604–1708. No real faceting backend — markup only.
          */}
          {resultsCount > 0 && (
            <div className="collection-sidebar">
              <span className="close-collection-sidebar">
                <svg
                  className="icon icon--close"
                  viewBox="0 0 19 19"
                  role="presentation"
                >
                  <path
                    d="M9.1923882 8.39339828l7.7781745-7.7781746 1.4142136 1.41421357-7.7781746 7.77817459 7.7781746 7.77817456L16.9705627 19l-7.7781745-7.7781746L1.41421356 19 0 17.5857864l7.7781746-7.77817456L0 2.02943725 1.41421356.61522369 9.1923882 8.39339828z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </svg>
              </span>

              <div className="category-filters-area">
                <form className="filter-form">
                  <input type="hidden" name="q" value={searchTerms} />

                  {/* ── Availability / Наличност ── */}
                  <div className="category-filters-area-section">
                    <span className="category-filters-section-title h4 active">
                      <span>Наличност</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable={false}
                        className="icon icon--angle-down svg-inline--fa fa-angle-down fa-w-10"
                        role="img"
                        viewBox="0 0 320 512"
                      >
                        <path
                          fill="currentColor"
                          d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"
                        />
                      </svg>
                    </span>

                    <ul className="category-filters-area-list advanced-filters active">
                      <li
                        className="advanced-filter"
                        data-group="availability"
                        data-handle="1"
                      >
                        <input
                          type="checkbox"
                          name="filter.v.availability"
                          value="1"
                          id="Filter-Availability-1"
                        />
                        <a
                          href="javascript: void(0);"
                          className="check_filter_value"
                        >
                          В наличност
                        </a>
                      </li>
                      <li
                        className="advanced-filter"
                        data-group="availability"
                        data-handle="0"
                      >
                        <input
                          type="checkbox"
                          name="filter.v.availability"
                          value="0"
                          id="Filter-Availability-2"
                        />
                        <a
                          href="javascript: void(0);"
                          className="check_filter_value"
                        >
                          Изчерпан
                        </a>
                      </li>
                    </ul>

                    <a
                      href="javascript: void(0);"
                      className="show_more_options"
                      data-default-text="Покажи всички Наличност"
                    >
                      <span>Покажи всички Наличност</span>
                    </a>
                  </div>

                  {/* ── Price / Цена ── */}
                  <div className="category-filters-area-section">
                    <span className="category-filters-section-title h4 active">
                      <span>Цена</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable={false}
                        className="icon icon--angle-down svg-inline--fa fa-angle-down fa-w-10"
                        role="img"
                        viewBox="0 0 320 512"
                      >
                        <path
                          fill="currentColor"
                          d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"
                        />
                      </svg>
                    </span>

                    <ul className="category-filters-area-list advanced-filters active">
                      <li className="advanced-filter">
                        <div className="filter-group-display__price-range">
                          <div className="filter-group-display__price-range-from filter-group-display__price-range-block">
                            <label
                              htmlFor="Filter-price-gte"
                              className="visually-hidden"
                            >
                              Мин. Цена
                            </label>
                            <input
                              name="filter.v.price.gte"
                              className="filter-group-display__price-range-input"
                              id="Filter-price-gte"
                              type="number"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div className="filter-group-display__price-divider">
                            -
                          </div>
                          <div className="filter-group-display__price-range-to filter-group-display__price-range-block">
                            <label
                              htmlFor="Filter-price-lte"
                              className="visually-hidden"
                            >
                              Макс Цена
                            </label>
                            <input
                              name="filter.v.price.lte"
                              className="filter-group-display__price-range-input"
                              id="Filter-price-lte"
                              type="number"
                              placeholder="2454"
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="price_range_container">
                          <input
                            className="price_range"
                            type="range"
                            data-name="filter.v.price.gte"
                            defaultValue="0"
                            min="0"
                            max="2454"
                            step="1"
                          />
                          <input
                            className="price_range"
                            type="range"
                            data-name="filter.v.price.lte"
                            min="0"
                            max="2454"
                            step="1"
                            defaultValue="2454"
                          />
                        </div>
                      </li>
                    </ul>

                    <a
                      href="javascript: void(0);"
                      className="show_more_options"
                      data-default-text="Покажи всички Цена"
                    >
                      <span>Покажи всички Цена</span>
                    </a>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="search-page-wrapper">
            {/*
              header_image == blank, so the heading renders inline.
              {% if search.performed == false %} … {% else %} … {% endif %}
              Mirror lines 1720–1726.
            */}
            <div className="text-center">
              <h1 className="h2">
                {performed && (
                  <span className="visually-hidden">Резултати на търсенето:</span>
                )}
                {headerHeading}
              </h1>
            </div>

            {/*
              Search form — grid wrapper + form (mirror lines 1731–1754).
              action="/search" matches the Shopify routes.search_url.
            */}
            <div className="grid">
              <div className="grid__item medium-up--six-tenths medium-up--push-two-tenths">
                {/* {% if search.performed and search.results_count == 0 %} */}
                {noResults && (
                  <div className="rte search--no-results-found text-center">
                    <p>Няма резултати. Пробвайте да промените ключовите думи</p>
                  </div>
                )}

                <form
                  action="/search"
                  method="get"
                  role="search"
                  className="search-form search-page-form"
                  onSubmit={handleSubmit}
                >
                  <div className="input-group input-group--nowrap">
                    <div className="input-group__field input-group__field--connected search-form__input-wrapper">
                      <label
                        htmlFor="search-form__input_main"
                        className="visually-hidden"
                      ></label>
                      <input
                        id="search-form__input_main"
                        ref={inputRef}
                        type="search"
                        name="q"
                        defaultValue={searchTerms}
                        placeholder="Търсене"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded="false"
                        aria-label="Търсене"
                        aria-haspopup="listbox"
                        className="search-form__input"
                        data-base-url="/search"
                      />

                      <input
                        type="hidden"
                        name="options[prefix]"
                        value="last"
                        aria-hidden="true"
                      />

                      <input
                        type="hidden"
                        name="type"
                        value="product"
                        aria-hidden="true"
                        id="search_page__mode"
                      />
                    </div>

                    <button
                      type="submit"
                      className="search-button__submit"
                      aria-label="Потърси"
                      data-search-page-predictive-search-submit=""
                    >
                      {/* {% include 'icon-search' %} — verbatim SVG from snippets/icon-search.liquid */}
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="presentation"
                        className="icon icon-search"
                        viewBox="0 0 37 40"
                      >
                        <path d="M35.6 36l-9.8-9.8c4.1-5.4 3.6-13.2-1.3-18.1-5.4-5.4-14.2-5.4-19.7 0-5.4 5.4-5.4 14.2 0 19.7 2.6 2.6 6.1 4.1 9.8 4.1 3 0 5.9-1 8.3-2.8l9.8 9.8c.4.4.9.6 1.4.6s1-.2 1.4-.6c.9-.9.9-2.1.1-2.9zm-20.9-8.2c-2.6 0-5.1-1-7-2.9-3.9-3.9-3.9-10.1 0-14C9.6 9 12.2 8 14.7 8s5.1 1 7 2.9c3.9 3.9 3.9 10.1 0 14-1.9 1.9-4.4 2.9-7 2.9z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* {% if search.performed %} */}
            {performed && (
              <>
                {/*
                  visually-hidden h2 with result count (mirror line 1763).
                  general.search.heading plural → "Резултати на търсенето"
                */}
                <h2 className="visually-hidden">Резултати на търсенето</h2>

                {/*
                  Mobile sidebar open button (filters_view_mode != 'no_sidebar', results.size > 0).
                  Mirror line 1768: class="search-page--open-sidebar-btn open_mobile_sidebar btn btn-gray"
                */}
                {resultsCount > 0 && (
                  <button
                    type="button"
                    className="search-page--open-sidebar-btn open_mobile_sidebar  btn btn-gray"
                  >
                    Филтър
                  </button>
                )}

                {/*
                  SearchGrid — pagination_mode "standart" → no id="AjaxinateContainer".
                  Mirror line 1772: class="SearchGrid grid"
                  settings.align_height = true → use_align_height (mirror line 1773).
                */}
                <div className="SearchGrid grid">
                  <div className="zoom-fade-animation  list-view-items use_align_height  ">
                    {/*
                      {% for item in search.results %}
                      All results are products (item.object_type == 'product') in our data layer.
                      {% include 'product-card-item', list: true, max_height: 345, product: item, show_vendor: true %}
                    */}
                    {results.map((product) => (
                      <div
                        key={product.id}
                        className="list-view-item zoom-fade-animation-element-wrapper"
                      >
                        <ProductCardItem
                          product={product}
                          maxHeight={MAX_HEIGHT}
                          showVendor={true}
                          list={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* {% if search.results_count < 2 %} — always render on no / single result */}
            {resultsCount < 2 && <div className="search--less-than-2-results"></div>}
          </div>
        </div>
      </div>
      {/* {% endpaginate %} */}
    </div>
  );
}

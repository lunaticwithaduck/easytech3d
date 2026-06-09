'use client';

import { useState } from 'react';
import { Icon } from '@/components/snippets/Icon';
import { cn } from '@/lib/cn';

// Translation of the `search_bar` capture in sections/header.liquid (predictive-search markup).
// The live theme.js opens the form on click and reveals the predictive panel on focus; here a small
// amount of state toggles the open/active classes so the pink search field expands the same way.
// There is no storefront search backend wired yet, so the predictive results container is rendered
// empty (its inner markup is populated by JS on the live site) and the GET form posts to /search.

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <div className={cn('search-bar__interior', open && 'search-bar--visible', '')}>
      <button
        type="button"
        className="header-search-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Icon name="search-loop" />
        <span className="icon__fallback-text">Потърси</span>
      </button>

      <div className="search-form__container" data-search-form-container>
        <div
          className={cn(
            'search_categories_menu',
            'site-nav--has-dropdown',
            'site-nav--has-centered-dropdown',
          )}
          data-has-dropdowns
        >
          <button
            className="site-nav__link site-nav__link--main search_categories_button  site-nav__link--button btn btn--primary"
            type="button"
            aria-expanded={categoriesOpen}
            aria-controls="Search_categories_menu__dropdown"
            onClick={() => setCategoriesOpen((v) => !v)}
          >
            <span className="search_categories_button__label">Всички Категории</span>
            <Icon name="chevron-down" />
          </button>

          <div
            className={cn(
              'small_dropdown site-nav__dropdown site-nav__dropdown--centered search_categories_dropdown',
              !categoriesOpen && 'critical-hidden',
            )}
            id="Search_categories_menu__dropdown"
          >
            <ul id="search-product-type" data-search-type="*">
              <li>
                <a data-value="Всички Категории" href="javascript:void(0)">
                  Всички Категории
                </a>
              </li>
            </ul>
          </div>
        </div>

        <form className="search-form search-bar__form" action="/search" method="get" role="search">
          <div className="search-form__input-wrapper">
            <label htmlFor="predictive-search-drawer-input" className="visually-hidden" />
            <input
              type="text"
              name="q"
              id="predictive-search-drawer-input"
              data-predictive-search-drawer-input
              placeholder="Търсене"
              aria-label="Търсене"
              autoComplete="off"
              autoCorrect="off"
              className="search-form__input search-bar__input"
              onFocus={() => setOpen(true)}
            />
            <input type="hidden" name="options[prefix]" value="last" aria-hidden="true" />

            <div className="predictive-search-wrapper predictive-search-wrapper--drawer ">
              <div className="predictive-search">
                <div className="search-bar__results" aria-hidden="true">
                  <div className="search-bar__results-inner" />
                </div>
              </div>
            </div>

            <button className="search-button__submit search-form__submit" type="submit">
              <Icon name="search-loop" />
              <span className="icon__fallback-text">Потърси</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

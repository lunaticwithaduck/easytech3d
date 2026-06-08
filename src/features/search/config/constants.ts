// BG copy for the search page — verbatim from the live theme's `general.search.*` strings
// (`locales/en.default.json`, which holds the Bulgarian storefront copy; see config-copy.md §2.2).
// Rendered through <Text value=…> so the translate pipeline falls back to these literals.
export const SEARCH_COPY = {
  // `general.search.title` — heading shown when no query has been performed yet
  // (`search.performed == false`, the `<h1 class="h2">` branch of search-page.liquid).
  title: 'Потърсете в нашия сайт',
  // `general.search.results_with_count.other` — the heading once a search runs. This single
  // `<h1 class="h2">` IS the result-count line in the theme. Curly quotes “…” match the live DOM
  // ("{count} резултати за “{terms}”"). `{count}` resolves via ICU; `{terms}` is the user's query.
  resultsWithCount: '{count} резултати за “{terms}”',
  // `general.search.heading.other` — visually-hidden screen-reader label before the count.
  headingSr: 'Резултати на търсенето',
  // `general.search.placeholder` — search field placeholder.
  placeholder: 'Търсене',
  // `general.search.submit` — submit button aria-label.
  submit: 'Потърси',
  // `general.search.no_results` — empty-results message (`search--no-results-found`).
  noResults: 'Няма резултати. Пробвайте да промените ключовите думи',
} as const;

// BG copy for the search page. Mirrors the Liquid `general.search.*` strings; rendered through
// <Text value=…> so the translate pipeline falls back to these literals until EN keys land.
export const SEARCH_COPY = {
  // Heading shown when no query has been performed.
  title: 'Търсене',
  // Eyebrow above the heading (matches the storefront section header rhythm).
  eyebrow: 'Каталог',
  // Field copy.
  placeholder: 'Търсене на продукти…',
  inputLabel: 'Търсене на продукти',
  submit: 'Търсене',
  // Result count line. `{count}` resolves via ICU; `{terms}` is the user's query (runtime data).
  resultsWithCount: '{count} резултата за «{terms}»',
  // Empty states.
  emptyTitle: 'Какво търсите?',
  emptyHint: 'Въведете дума за търсене, за да намерите продукти.',
  noResultsTitle: 'Няма намерени резултати',
  noResultsHint: 'Опитайте с друга дума или разгледайте нашите продукти.',
  browseAll: 'Разгледай всички продукти',
} as const;

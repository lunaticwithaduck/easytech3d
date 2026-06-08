// Static copy + config for the Header chrome. BG strings are the live storefront copy
// (resolved from the theme locale chain `en.default.json`, see config-copy.md §2.3).
// Rendered through <Text value=> so they flow through the translate fallback (R3).
export const HEADER_COPY = {
  brand: 'EasyTech3D',
  // layout.customer.log_in — the top utility "My Account" link
  accountLabel: 'Моят Акаунт',
  // sections.header.all_categories — the pink search category pill
  allCategories: 'Всички Категории',
  // general.search.placeholder
  searchPlaceholder: 'Търсене',
  // general.search.submit
  searchLabel: 'Потърси',
  // layout.cart.title
  cartLabel: 'Количка',
  // layout.navigation.menu
  openMenuLabel: 'Навигация',
  // general.accessibility.close_modal
  closeMenuLabel: 'Затвори',
} as const;

// Locale switch options — BG-primary store with an EN switch (show_locale_selector=true).
export const LOCALE_OPTIONS = [
  { value: 'bg', label: 'BG' },
  { value: 'en', label: 'EN' },
] as const;

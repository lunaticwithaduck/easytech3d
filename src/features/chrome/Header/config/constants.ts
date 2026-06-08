// Static copy + config for the Header chrome. BG strings are rendered as `value=` defaults
// (the translate fallback emits literals when no message key exists).
export const HEADER_COPY = {
  brand: 'EasyTech3D',
  searchPlaceholder: 'Търсене...',
  searchLabel: 'Търсене',
  cartLabel: 'Количка',
  accountLabel: 'Моят Акаунт',
  openMenuLabel: 'Отвори меню',
  closeMenuLabel: 'Затвори меню',
} as const;

// Locale switch options — BG-primary store with an EN switch.
export const LOCALE_OPTIONS = [
  { value: 'bg', label: 'BG' },
  { value: 'en', label: 'EN' },
] as const;

// Static copy for the home page. BG literals double as i18n message keys — the translate
// pipeline falls back to the literal when no key exists (per the build contract).

export const HOME_COPY = {
  newsletterCta: 'Абонирай се',
  newsletterPlaceholder: 'Вашият имейл адрес',
  newsletterAria: 'Имейл адрес за абонамент',
  newsletterSuccess: 'Благодарим! Абонаментът Ви е регистриран.',
  heroPrev: 'Предишен слайд',
  heroNext: 'Следващ слайд',
  heroSlideLabel: 'Зареди слайд {number}',
  blogReadMore: 'Прочети повече',
  // featured-blog card author line — theme `blogs.article.by_author`: "от {author}".
  blogByAuthor: 'от {author}',
} as const;

// Lucide icon names used by the FeatureIcons section, mapped from homeConfig.features[].icon.
export const FEATURE_ICON_NAMES = ['badge-dollar-sign', 'truck', 'mail'] as const;

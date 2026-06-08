// Title lookup for the static content pages and policy pages. Slugs that aren't listed fall back
// to a humanised version of the slug itself (see resolvePageTitle in ../utils/page.utils).

export const PAGE_TITLES: Record<string, string> = {
  'общи-условия': 'Общи условия',
  '3d-принт-при-поръчка': '3D Print на поръчка',
  '3d-print-on-order': '3D Print на поръчка',
};

export const POLICY_TITLES: Record<string, string> = {
  'privacy-policy': 'Политика за поверителност',
  'refund-policy': 'Политика за връщане',
  'terms-of-service': 'Общи условия',
};

// Placeholder prose shown on generic content pages until real CMS copy is wired in.
export const PLACEHOLDER_PARAGRAPHS = [
  'Тази страница е в процес на изграждане. Скоро тук ще намерите подробна информация.',
  'EasyTech3D предлага висококачествени 3D принтери, филаменти и аксесоари, подбрани за любители и професионалисти. Стремим се да направим 3D печата достъпен за всеки.',
  'За въпроси относно съдържанието на тази страница, моля свържете се с нашия екип чрез страницата за контакти.',
] as const;

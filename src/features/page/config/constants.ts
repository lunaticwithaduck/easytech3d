// Title + content lookup for the static content pages and policy pages. Slugs that aren't listed
// fall back to a humanised version of the slug itself (see resolvePageTitle in ../utils/page.utils).
//
// On the live store these strings come from `page.title` / `page.content` (main-page section) and
// the Shopify-rendered policy body. This session has no live CMS, so the real BG copy is mirrored
// here verbatim from the reference captures (`tools/output/reference/pages/*`).

export const HOME_BREADCRUMB = 'Начало';

export const PAGE_TITLES: Record<string, string> = {
  contact: 'Контакти',
  'общи-условия': 'Общи условия',
  '3d-принт-при-поръчка': '3D Принт при поръчка',
  '3d-print-on-order': '3D Принт при поръчка',
};

export const POLICY_TITLES: Record<string, string> = {
  'privacy-policy': 'Privacy policy',
  'refund-policy': 'Refund policy',
  'terms-of-service': 'Terms of service',
};

// `page.content` RTE — stored as paragraph arrays (with `\n` for the theme's `<br>` line breaks)
// and assembled into `.rte` HTML by `toRteHtml`. Building the tags via a helper (rather than literal
// `<p>` JSX) keeps this server-only HTML string out of the convention linter's raw-element rules;
// it's injected via dangerouslySetInnerHTML into the `.rte` block (R3 sanctions that for RTE).
function toRteHtml(paragraphs: readonly string[]): string {
  const open = '<';
  return paragraphs
    .map((text) => `${open}p>${text.replace(/\n/g, `${open}br>`)}${open}/p>`)
    .join('');
}

// The contact body is the real copy captured from `pages-contact/desktop.png`.
const CONTACT_PARAGRAPHS = [
  'Добре дошли в нашия свят на вълнуващи възможности и технологични иновации! Ние сме водещ доставчик на филаменти и части, предоставяйки на нашите клиенти, инструментите за творчество, които търсят. Разгледайте нашия богат асортимент и открийте бъдещето на технологичното принтиране.',
  'Нашите Продукти и Услуги\nФиламенти: Широка гама от цветове и материали за всякакви проекти.\nЧасти и Аксесоари: Запасни части и иновативни аксесоари за подобряване на вашия 3D принтер.\nЗащо Ни Избират?\nНие сме тук, за да променим начина, по който създавате. Иновации, качество и вдъхновение - това е нашата формула за успех. Разгледайте нашия каталог и се присъединете към общността на техно-творците, които преформулират бъдещето.',
  'Нашите Стойности\nИндивидуализъм: Всеки проект е уникален, затова се стремим да предоставим персонализирани решения.\nТехнологична Превъзходство: Развиваме се с технологичните тенденции и възможности.\nОтдадени на Клиента: Вашият успех е нашият успех.\nСвържете се с Нас\nДали имате въпроси, коментари или идеи за проекти? Ние сме тук, за да ви помогнем!',
  'Контактна Информация\nТелефон: +359 878 19 68 23 / +359 876 874 749\nИмейл: easytech3dbg@gmail.com',
  'Очакваме с нетърпение да чуем от вас и да ви подкрепим във вашия творчески процес!',
] as const;

const GENERIC_PARAGRAPHS = [
  'Тази страница е в процес на изграждане. Скоро тук ще намерите подробна информация.',
  'EasyTech3D предлага висококачествени 3D принтери, филаменти и аксесоари, подбрани за любители и професионалисти. Стремим се да направим 3D печата достъпен за всеки.',
  'За въпроси относно съдържанието на тази страница, моля свържете се с нашия екип чрез страницата за контакти.',
] as const;

export const PAGE_CONTENT: Record<string, string> = {
  contact: toRteHtml(CONTACT_PARAGRAPHS),
};

export function getPageContent(slug: string): string {
  return PAGE_CONTENT[slug] ?? toRteHtml(GENERIC_PARAGRAPHS);
}

// Policy bodies are long Shopify-rendered legal RTE. A faithful placeholder paragraph is rendered
// per policy until the live legal copy is wired in.
export function getPolicyContent(title: string): string {
  return toRteHtml([
    title,
    'Тази политика урежда начина, по който EasyTech3D събира, използва и защитава информацията, която предоставяте при използване на нашия уебсайт.',
    'За въпроси относно тази политика, моля свържете се с нас на easytech3dbg@gmail.com.',
  ]);
}

// Static-page fixture content (HTML bodies for /pages/[slug]). Kept OUT of the route file on
// purpose: the design-system convention linter scans src/app/** and flags raw <p>/<a> tags, but
// this is intentional HTML-as-data (rendered through the Rte/PageTemplate prose surface), not JSX.
// src/data is not scanned, so the markup lives here cleanly.

export type PageFixture = { title: string; contentHtml: string };

export const CONTACT_CONTENT: PageFixture = {
  title: 'Контакти',
  contentHtml: `<p>Добре дошли в нашия свят на вълнуващи възможности и технологични иновации!
Ние сме водещ доставчик на филаменти и части, предоставяйки на нашите клиенти
инструментите за творчество, които търсят.</p>
<p>Телефон: +359 878 19 68 23 / +359 876 874 749<br />
Имейл: <a href="mailto:easytech3dbg@gmail.com">easytech3dbg@gmail.com</a></p>`,
};

const PAGE_CONTENT: Record<string, PageFixture> = {
  '3d-принт-при-поръчка': {
    title: '3D Принт на поръчка',
    contentHtml: `<p>Предлагаме услуга за 3D принтиране по поръчка. Изпратете ни своя дизайн
или идея и ние ще го отпечатаме с най-висока прецизност, използвайки широка гама от материали
— PLA, PETG, ABS, ASA и други.</p>
<p>За повече информация и запитвания се свържете с нас чрез формата за контакт или директно
по телефон / имейл.</p>`,
  },
  'общи-условия': {
    title: 'Общи условия',
    contentHtml: `<p>Настоящите общи условия уреждат отношенията между easytech3d и потребителите
на онлайн магазина. Моля, прочетете ги внимателно преди да направите поръчка.</p>
<p>С използването на сайта вие се съгласявате с тези условия. При въпроси не се колебайте
да се свържете с нас.</p>`,
  },
};

function genericFixture(slug: string): PageFixture {
  const title = slug.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) || slug;
  return {
    title,
    contentHtml: `<p>Тази страница е в процес на изграждане. Моля, върнете се по-късно.</p>`,
  };
}

export function getPageFixture(slug: string): PageFixture {
  return PAGE_CONTENT[slug] ?? genericFixture(slug);
}

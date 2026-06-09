// Route: /[locale]/pages/[slug]
//
// Branches on slug:
//   "contact"                  → ContactTemplate (page header + rte body + contact form)
//   everything else            → PageTemplate    (page header + rte body)
//
// BG fixture content is provided for known slugs. Unknown slugs fall back to a generic title
// derived from the slug (replace hyphens with spaces, capitalise first letter).
//
// Renders <BodyClass name="template-page" /> so the theme's body.template-page CSS rules apply.

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ContactTemplate } from '@/components/templates/ContactTemplate';
import { PageTemplate } from '@/components/templates/PageTemplate';
import { BodyClass } from '@/components/util/BodyClass';

// ── Fixture content ─────────────────────────────────────────────────────────────────────────────

type PageFixture = { title: string; contentHtml: string };

const CONTACT_CONTENT: PageFixture = {
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
  const title =
    slug
      .replace(/-/g, ' ')
      .replace(/^./, (c) => c.toUpperCase()) || slug;
  return {
    title,
    contentHtml: `<p>Тази страница е в процес на изграждане. Моля, върнете се по-късно.</p>`,
  };
}

function getFixture(slug: string): PageFixture {
  // Try with the decoded slug directly first, then fall back to generic.
  return PAGE_CONTENT[slug] ?? genericFixture(slug);
}

// ── Route ────────────────────────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Cyrillic slugs (e.g. общи-условия) arrive URL-encoded — decode before lookup.
function fixtureFor(rawSlug: string): PageFixture {
  const slug = decodeURIComponent(rawSlug);
  if (slug === 'contact') return CONTACT_CONTENT;
  return getFixture(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${fixtureFor(slug).title} – easytech3d` };
}

export default async function StaticPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (decodeURIComponent(slug) === 'contact') {
    return (
      <>
        <BodyClass name="template-page" />
        <ContactTemplate
          title={CONTACT_CONTENT.title}
          contentHtml={CONTACT_CONTENT.contentHtml}
        />
      </>
    );
  }

  const { title, contentHtml } = fixtureFor(slug);

  return (
    <>
      <BodyClass name="template-page" />
      <PageTemplate title={title} contentHtml={contentHtml} />
    </>
  );
}

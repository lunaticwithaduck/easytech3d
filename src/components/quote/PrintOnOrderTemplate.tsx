import { JsonLd } from '@/components/util/JsonLd';
import { Container, Heading, Text } from '@/design-system';
import { QuoteCalculator } from './QuoteCalculator';

const STEPS = [
  {
    title: '1. Качете STL файл',
    body: 'Плъзнете вашия 3D модел в калкулатора. Поддържаме STL от Tinkercad, Fusion 360, Blender, SolidWorks.',
  },
  {
    title: '2. Изберете материал',
    body: 'PLA за декорация, PETG за здрави части, ABS за топлоустойчивост, ASA за outdoor.',
  },
  {
    title: '3. Получете цена и поръчайте',
    body: 'Калкулаторът изчислява обем, тегло и цена. Заявете оферта или изпратете по имейл.',
  },
];

const MATERIALS_TABLE = [
  ['PLA', '0.28 €/г', 'Лесен за печат, гладка повърхност', 'Фигурки, прототипи, декорация'],
  ['PLA Pro', '0.28 €/г', 'По-здрав от стандартен PLA', 'Функционални части, механизми'],
  ['PETG', '0.28 €/г', 'Издръжлив, химически устойчив', 'Кутии, държачи, инструменти'],
  ['ABS', '0.38 €/г', 'Топлоустойчив, лек, здрав', 'Авто части, електроника'],
  ['ASA', '0.41 €/г', 'UV-устойчив, издържа навън', 'Градински аксесоари, табели'],
];

const FAQ = [
  [
    'Колко струва 3D принт по поръчка?',
    'Цената зависи от материала и размера. PLA и PETG от 0.28 €/г, ABS от 0.38 €/г, ASA от 0.41 €/г. Минимална поръчка: 5.11 €. За 5+ бройки — 10% отстъпка, за 10+ — 20%.',
  ],
  [
    'Какви материали предлагате за 3D печат?',
    'PLA, PLA Pro, PETG, ABS и ASA. PLA е най-популярен за декорация, PETG за здрави части, ABS за топлоустойчивост, ASA за употреба навън.',
  ],
  [
    'Колко време отнема 3D принтиране по поръчка?',
    'Повечето поръчки се изпълняват за 1-3 работни дни. За спешни поръчки — свържете се с нас.',
  ],
  [
    'Какъв файл формат е нужен за 3D печат?',
    'STL файлове. Повечето 3D програми (Tinkercad, Fusion 360, Blender, SolidWorks) експортират в STL.',
  ],
  [
    'Доставяте ли в цяла България?',
    'Да! Доставка с куриер навсякъде в България. Безплатна доставка за поръчки над 76.69 €.',
  ],
  [
    'Предлагате ли отстъпка за количество?',
    'Да — 10% отстъпка за 5+ броя и 20% за 10+ броя от един модел.',
  ],
];

const GALLERY = [
  'PLA фигурка — декорация',
  'PETG държач — функционален',
  'ABS прототип — инженеринг',
  'ASA табела — outdoor',
];

function faqLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function PrintOnOrderTemplate() {
  return (
    <Container className="max-w-[760px] py-10">
      <JsonLd data={faqLd()} />

      <QuoteCalculator />

      {/* Gallery */}
      <div className="mt-6 rounded-xl bg-surface p-6 shadow-sm sm:p-8">
        <Heading as="h2" level={4} className="mb-4">
          Примерни изработки
        </Heading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GALLERY.map((caption) => (
            <div key={caption}>
              <div className="flex aspect-square items-center justify-center rounded-xl bg-page p-3 text-center text-xs text-ink/40">
                Снимка скоро
              </div>
              <Text as="p" size="xs" color="muted" className="mt-1.5 text-center" value={caption} />
            </div>
          ))}
        </div>
      </div>

      {/* SEO content */}
      <div className="mt-6 rounded-xl bg-surface p-6 shadow-sm sm:p-8">
        <Heading as="h2" level={4} className="mb-4">
          3D принтиране по поръчка — как работи?
        </Heading>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-xl bg-page p-4">
              <Text
                as="span"
                size="base"
                weight="bold"
                color="primary"
                className="mb-1.5 block"
                value={s.title}
              />
              <Text as="p" size="sm" color="muted" value={s.body} />
            </div>
          ))}
        </div>

        <Heading as="h2" level={4} className="mb-4">
          Материали за 3D печат
        </Heading>
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Материал', 'Цена', 'Предимства', 'Подходящ за'].map((h) => (
                  <th
                    key={h}
                    className="border-b-2 border-ink px-3 py-2.5 text-left text-xs uppercase tracking-wide text-ink"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATERIALS_TABLE.map((row) => (
                <tr key={row[0]} className="hover:bg-page">
                  <td className="border-b border-border px-3 py-2.5 font-bold text-ink">
                    {row[0]}
                  </td>
                  <td className="border-b border-border px-3 py-2.5 text-ink/70">{row[1]}</td>
                  <td className="border-b border-border px-3 py-2.5 text-ink/70">{row[2]}</td>
                  <td className="border-b border-border px-3 py-2.5 text-ink/70">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading as="h2" level={4} className="mb-4">
          Често задавани въпроси
        </Heading>
        <div>
          {FAQ.map(([q, a]) => (
            <details key={q} className="border-b border-border last:border-b-0">
              <summary className="flex cursor-pointer items-center justify-between py-3.5 text-base font-semibold text-ink">
                {q}
              </summary>
              <Text as="p" size="sm" color="muted" className="pb-3.5" value={a} />
            </details>
          ))}
        </div>
      </div>
    </Container>
  );
}

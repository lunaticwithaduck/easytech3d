// Materials, colours, pricing config — ported verbatim from the easytech3d-quote reference.
// Prices are €/gram (converted from BGN at the fixed 1 EUR = 1.95583 BGN rate — see
// contracts/euro.md). MIN_PRICE / discount tiers / dimension cap match the live calculator.

export type MaterialId = 'pla' | 'pla-pro' | 'petg' | 'abs' | 'asa';

export interface Material {
  id: MaterialId;
  label: string;
  density: number; // g/cm³
  pricePerGram: number; // €/g
  flow: number; // g/h (for print-time estimate)
}

export const MATERIALS: Material[] = [
  { id: 'pla', label: 'PLA', density: 1.24, pricePerGram: 0.2812, flow: 25 },
  { id: 'pla-pro', label: 'PLA Pro', density: 1.24, pricePerGram: 0.2812, flow: 22 },
  { id: 'petg', label: 'PETG', density: 1.27, pricePerGram: 0.2812, flow: 22 },
  { id: 'abs', label: 'ABS', density: 1.04, pricePerGram: 0.3835, flow: 24 },
  { id: 'asa', label: 'ASA', density: 1.07, pricePerGram: 0.409, flow: 22 },
];

export const MIN_PRICE = 5.11; // €
export const MAX_DIM_MM = 220;
export const DISCOUNT_TIERS = [
  { min: 10, pct: 20 },
  { min: 5, pct: 10 },
];

// PLA gets grouped colours; other materials a flat list.
export const PLA_GROUPS: Record<string, string[]> = {
  Стандартни: [
    'Бял',
    'Черен',
    'Сив',
    'Светло Сиво',
    'Натурал',
    'Червен',
    'Керемидено Червено',
    'Рубинено Червено',
    'Светофарно Червен',
    'Син',
    'Светло Синьо',
    'Тъмно Синьо',
    'Зелен',
    'Военно Зелено',
    'Морско Зелено',
    'Ментово Зелено',
    'Жълт',
    'Златисто Жълто',
    'Бананово Жълто',
    'Светло Жълто',
    'Интензивно Жълто',
    'Оранжев',
    'Интензивно Оранжево',
    'Тиквено Оранжево',
    'Неоново Оранжево',
    'Розов',
    'Бебешко Розово',
    'Електрическо Розово',
    'Тъмно Розово',
    'Интензивно Розово Светло',
    'Интензивно Розово Наситено',
    'Виолетово',
    'Лилав',
    'Тюркоаз',
    'Средно Тюркоазено',
    'Кафе',
    'Шоколадово Кафяво',
    'Сьомга',
    'Тъмна Кожа',
  ],
  Матови: [
    'Мат Лавандула',
    'Зелен Мат',
    'Червен Мат',
    'Жълт Мат',
    'Меден Мат',
    'Светъл Корал Мат',
    'Матово Прашно Розово',
    'Слейт Син Матов',
    'Матов Светло Сив',
    'Мат Скин',
    'Манго Мат',
    'Матов Син',
  ],
  Перла: [
    'Зелена Перла',
    'Тюркоазена Перла',
    'Тъмно Виолетова Перла',
    'Розова Перла',
    'Прасковена Перла',
  ],
  'Металик / Silk': [
    'Златен Металик',
    'Сребърен Металик',
    'Магента Металик',
    'Бронз',
    'Бронзов',
    'МЕД Метален Ефект',
  ],
  'Специални ефекти': [
    'Мрамор',
    'Мрамор Кафяв',
    'Жълт Мрамор',
    'Бикольорно',
    'Rainbow',
    'Галактически Син',
    'Nebula Chameleon',
    'Черен Блестящ',
  ],
  Полупрозрачни: [
    'Прозрачен',
    'Полупрозрачно Червено',
    'Полупрозрачен Оранжев',
    'Полупрозрачен Жълт',
    'Ледено Синьо',
    'HoneyDew',
  ],
  Светещи: ['Зелен Светещ', 'Светещ в Тъмното - Синьо'],
  Ароматни: ['Ванилия', 'Ябълка', 'Лавандула', 'Роза'],
};

export const MATERIAL_COLORS: Record<MaterialId, string[]> = {
  pla: Object.values(PLA_GROUPS).flat(),
  'pla-pro': ['Бял', 'Черен', 'Сив', 'Червен', 'Син', 'Зелен'],
  petg: ['Бял', 'Черен', 'Прозрачен', 'Син', 'Червен', 'Зелен'],
  abs: ['Бял', 'Черен', 'Сив', 'Червен'],
  asa: ['Бял', 'Черен', 'Сив'],
};

export function getDiscount(qty: number): number {
  for (const t of DISCOUNT_TIERS) if (qty >= t.min) return t.pct;
  return 0;
}

export function infillHint(v: number): string {
  if (v <= 15) return `${v}% — леки, декоративни части`;
  if (v <= 30) return `${v}% — добре за повечето модели`;
  if (v <= 60) return `${v}% — здрави функционални части`;
  return `${v}% — максимална здравина, по-тежко и по-бавно`;
}

export function formatTime(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 24) return `${hours.toFixed(1)} ч`;
  const d = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  return `${d} д ${h} ч`;
}

const MONTHS = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];

function addWorkdays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export function deliveryEstimate(printHours: number): string {
  const printDays = Math.ceil(printHours / 16); // ~16h print/day
  const totalMin = printDays + 1 + 1; // + processing + shipping min
  const totalMax = printDays + 1 + 2;
  const now = new Date();
  const from = addWorkdays(now, totalMin);
  const to = addWorkdays(now, totalMax);
  return `${from.getDate()} ${MONTHS[from.getMonth()]} – ${to.getDate()} ${MONTHS[to.getMonth()]}`;
}

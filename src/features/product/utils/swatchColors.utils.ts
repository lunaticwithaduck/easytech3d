// Maps BG color-option values to a CSS fill for the swatch circles, and detects which option is a
// color option (mirroring the theme's `is_color` check in `snippets/swatch.liquid`, which matches
// the option name against `color,colour,couleur,colore,farbe,…`).

const COLOR_NAME_TOKENS = ['цвят', 'color', 'colour', 'couleur', 'colore', 'farbe', 'färg'];

/** True when an option name denotes a color (renders as swatch circles, not pills). */
export function isColorOption(optionName: string): boolean {
  const lower = optionName.toLowerCase();
  return COLOR_NAME_TOKENS.some((token) => lower.includes(token));
}

// BG color-value → hex fill. Falls back to a neutral grey for unknown values so the circle is always
// painted (the live store uses per-variant swatch media; this stands in until the backend serves it).
const COLOR_HEX: Record<string, string> = {
  Черен: '#232323',
  Бял: '#ffffff',
  Червен: '#d0021b',
  Син: '#1b6fd0',
  Жълт: '#f5c518',
  Зелен: '#3aa655',
  Оранжев: '#f5821f',
  Сив: '#9b9b9b',
};

/** Resolve a color-value name to a CSS color. */
export function swatchColorFor(value: string): string {
  return COLOR_HEX[value] ?? '#9b9b9b';
}

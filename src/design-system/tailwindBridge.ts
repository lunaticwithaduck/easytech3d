// Token → Tailwind class-name maps. Components reference these inside CVA `*.styles.ts`
// files instead of hardcoding strings, so a token rename flows everywhere.

import { colors } from './tokens';
import { fontSize, fontWeight, letterSpacing, lineHeight } from './typography';

type ClassMap<T extends Record<string, unknown>> = Record<keyof T, string>;

function prefixKeys<T extends Record<string, unknown>>(obj: T, prefix: string): ClassMap<T> {
  return Object.fromEntries(Object.keys(obj).map((key) => [key, `${prefix}-${key}`])) as ClassMap<T>;
}

export const textSize = prefixKeys(fontSize, 'text');
export const textWeight = prefixKeys(fontWeight, 'font');
export const textLeading = prefixKeys(lineHeight, 'leading');
export const textTracking = prefixKeys(letterSpacing, 'tracking');
export const textColor = prefixKeys(colors, 'text');
export const bgColor = prefixKeys(colors, 'bg');
export const borderColor = prefixKeys(colors, 'border');

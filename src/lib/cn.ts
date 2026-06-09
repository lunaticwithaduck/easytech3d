// Minimal classnames joiner (no Tailwind merge needed — we emit the theme's own class names,
// not utilities). Falsy entries are dropped.
export type ClassValue = string | number | false | null | undefined;

export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ');
}

import { useTranslations } from 'next-intl';

export type TranslationParams = Record<string, string | number>;
export type TranslationDefault = string;

/**
 * The `<Text value="…" />` resolver. A value is either a namespaced message key
 * (e.g. "Home.title") or the literal English default. If the key exists in the active
 * locale's messages it's translated; otherwise the value is rendered as-is with simple
 * `{param}` interpolation — so new copy shows its default until a translation is added,
 * with no MISSING_MESSAGE noise.
 */
export function useTranslate() {
  const t = useTranslations();

  return function translate(key: string, params?: TranslationParams): string {
    if (t.has(key)) return t(key, params);
    if (!params) return key;
    return key.replace(/\{(\w+)\}/g, (match, name) =>
      name in params ? String(params[name]) : match,
    );
  };
}

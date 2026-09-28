/**
 * Idiomas. Para activar otro idioma:
 *   1. Agrégalo a ENABLED_LOCALES.
 *   2. Crea src/content/pages/<idioma>/, src/content/legal/<idioma>/ y
 *      src/content/site/<idioma>.yaml.
 *   3. Corre `pnpm check:i18n`.
 * Guía: docs/guias/idiomas.md (o la skill `agregar-idioma`).
 */
export const LOCALE_META = {
  es: {
    label: "Español",
    hreflang: "es-MX",
    ogLocale: "es_MX",
    htmlLang: "es-MX",
  },
  en: { label: "English", hreflang: "en", ogLocale: "en_US", htmlLang: "en" },
} as const

export type Locale = keyof typeof LOCALE_META

export const DEFAULT_LOCALE: Locale = "es"

export const ENABLED_LOCALES: readonly Locale[] = ["es"]

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && value in LOCALE_META
}

export function isEnabledLocale(value: string | undefined): value is Locale {
  return isLocale(value) && ENABLED_LOCALES.includes(value)
}

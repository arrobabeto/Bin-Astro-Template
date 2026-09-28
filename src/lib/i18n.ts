import {
  DEFAULT_LOCALE,
  ENABLED_LOCALES,
  isLocale,
  type Locale,
} from "~/config/locales"

/**
 * Rutas por idioma. El idioma por defecto va sin prefijo (/servicios) y los
 * demás con prefijo (/en/services).
 */

export type ParsedEntryId = { locale: Locale; slug: string }

/** "es/index" → { locale: "es", slug: "" }; "en/legal/terms" → { "en", "legal/terms" } */
export function parseEntryId(id: string): ParsedEntryId {
  const [first, ...rest] = id.split("/")
  if (!isLocale(first)) {
    throw new Error(
      `El contenido "${id}" debe estar dentro de una carpeta de idioma (ej. es/${id}).`,
    )
  }
  const slug = rest.join("/")
  return { locale: first, slug: slug === "index" ? "" : slug }
}

export function localePath(locale: Locale, slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "")
  if (locale === DEFAULT_LOCALE) return clean ? `/${clean}` : "/"
  return clean ? `/${locale}/${clean}` : `/${locale}`
}

/** Deriva el idioma de una URL (útil para la 404 y los endpoints). */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0]
  return isLocale(first) && ENABLED_LOCALES.includes(first)
    ? first
    : DEFAULT_LOCALE
}

export function isEnabled(locale: Locale): boolean {
  return ENABLED_LOCALES.includes(locale)
}

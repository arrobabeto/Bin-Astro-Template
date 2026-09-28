import { getCollection, getEntry, type CollectionEntry } from "astro:content"

import { DEFAULT_LOCALE, type Locale } from "~/config/locales"

import { isEnabled, localePath, parseEntryId } from "./i18n"

/**
 * Fuente única de rutas del sitio: la usan [...slug].astro, el sitemap,
 * llms.txt y los checks. Si agregas una colección con páginas, regístrala aquí.
 */

type RouteBase = {
  locale: Locale
  slug: string
  path: string
  translationKey: string
  title: string
  description: string
  noindex: boolean
  canonical?: string
  updatedAt?: Date
}

export type PageRoute = RouteBase & {
  kind: "page"
  entry: CollectionEntry<"pages">
}
export type LegalRoute = RouteBase & {
  kind: "legal"
  entry: CollectionEntry<"legal">
}
export type SiteRoute = PageRoute | LegalRoute

export async function getRoutes(): Promise<SiteRoute[]> {
  const [pages, legal] = await Promise.all([
    getCollection("pages"),
    getCollection("legal"),
  ])

  const routes: SiteRoute[] = []

  for (const entry of pages) {
    const { locale, slug } = parseEntryId(entry.id)
    if (!isEnabled(locale)) continue
    routes.push({
      kind: "page",
      entry,
      locale,
      slug,
      path: localePath(locale, slug),
      translationKey: entry.data.translationKey ?? (slug || "home"),
      title: entry.data.title,
      description: entry.data.description,
      noindex: entry.data.seo.noindex,
      canonical: entry.data.seo.canonical,
      updatedAt: entry.data.updatedAt,
    })
  }

  for (const entry of legal) {
    const { locale, slug } = parseEntryId(entry.id)
    if (!isEnabled(locale)) continue
    routes.push({
      kind: "legal",
      entry,
      locale,
      slug,
      path: localePath(locale, slug),
      translationKey: entry.data.translationKey ?? slug,
      title: entry.data.title,
      description: entry.data.description,
      noindex: entry.data.seo.noindex,
      canonical: entry.data.seo.canonical,
      updatedAt: entry.data.updatedAt,
    })
  }

  const byPath = new Map<string, SiteRoute>()
  for (const route of routes) {
    const previous = byPath.get(route.path)
    if (previous) {
      throw new Error(
        `Dos contenidos generan la misma URL ${route.path}: ${previous.entry.id} y ${route.entry.id}.`,
      )
    }
    byPath.set(route.path, route)
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path))
}

export type Alternate = { locale: Locale; path: string }

/** Versiones del mismo contenido en otros idiomas (para hreflang). */
export function alternatesFor(
  route: SiteRoute,
  routes: SiteRoute[],
): Alternate[] {
  return routes
    .filter(
      (candidate) =>
        candidate.kind === route.kind &&
        candidate.translationKey === route.translationKey &&
        !candidate.noindex,
    )
    .map((candidate) => ({ locale: candidate.locale, path: candidate.path }))
}

export async function getSiteChrome(locale: Locale) {
  const entry =
    (await getEntry("site", locale)) ?? (await getEntry("site", DEFAULT_LOCALE))
  if (!entry) {
    throw new Error(
      `Falta src/content/site/${DEFAULT_LOCALE}.yaml con los textos del sitio.`,
    )
  }
  return entry.data
}

export type SiteChrome = Awaited<ReturnType<typeof getSiteChrome>>

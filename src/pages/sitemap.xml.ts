import type { APIRoute } from "astro"

import { LOCALE_META, DEFAULT_LOCALE } from "~/config/locales"
import { alternatesFor, getRoutes } from "~/lib/routes"
import { absoluteUrl, escapeXml, indexableBuild } from "~/lib/seo"

/**
 * sitemap.xml generado desde el contenido. Solo incluye URLs canónicas e
 * indexables: las páginas con `seo.noindex: true` o `seo.canonical` quedan
 * fuera automáticamente. Se ve bonito en el navegador gracias a sitemap.xsl.
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL("http://localhost:4321")
  const routes = indexableBuild ? await getRoutes() : []
  const indexable = routes.filter((route) => !route.noindex && !route.canonical)

  const urls = indexable.map((route) => {
    const alternates = alternatesFor(route, routes)
    const links =
      alternates.length > 1
        ? [
            ...alternates.map(
              (alt) =>
                `    <xhtml:link rel="alternate" hreflang="${LOCALE_META[alt.locale].hreflang}" href="${escapeXml(absoluteUrl(alt.path, origin))}" />`,
            ),
            ...alternates
              .filter((alt) => alt.locale === DEFAULT_LOCALE)
              .map(
                (alt) =>
                  `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(alt.path, origin))}" />`,
              ),
          ]
        : []
    return [
      "  <url>",
      `    <loc>${escapeXml(absoluteUrl(route.path, origin))}</loc>`,
      ...(route.updatedAt
        ? [
            `    <lastmod>${route.updatedAt.toISOString().slice(0, 10)}</lastmod>`,
          ]
        : []),
      ...links,
      "  </url>",
    ].join("\n")
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n")

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
